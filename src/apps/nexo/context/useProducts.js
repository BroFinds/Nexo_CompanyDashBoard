import { useCallback, useEffect, useRef, useState } from "react";
import api, { getSession, fetchPage } from "@/services/api";

// ── Products cache (localStorage, scoped per company) ────────────────────────
// Products change rarely, so we download them once and serve every consumer
// from cache. The cache is invalidated on logout (api.js → clearSession) and
// rewritten whenever products mutate locally (add/update/disable/refresh).

const PRODUCTS_CACHE_KEY = "nexo_products_cache";

const readProductsCache = () => {
  try {
    const session = getSession();
    if (!session?.companyId) return null;
    const raw = localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    if (cache?.companyId !== session.companyId) return null;
    return Array.isArray(cache.products) ? cache.products : null;
  } catch {
    return null;
  }
};

const writeProductsCache = (products) => {
  try {
    const session = getSession();
    if (!session?.companyId) return;
    localStorage.setItem(
      PRODUCTS_CACHE_KEY,
      JSON.stringify({
        companyId: session.companyId,
        products,
        cachedAt: Date.now(),
      }),
    );
  } catch (e) {
    console.error("writeProductsCache:", e);
  }
};

export const mapProduct = (p) => {
  const pricing = p.priceMappings?.[0] ?? {};
  return {
    product_uid: p.productUid || p.product_uid,
    product_name: p.productName || p.product_name || "",
    product_code: p.productCode || p.product_code || "",
    category_uid: p.categoryUid || p.category_uid || "",
    measurement_uid: p.measurementUid || p.measurement_uid || "",
    measurement_text: p.measurement?.measurementText || "",
    measurement_value: p.sizeText ?? p.measurement_value ?? 1,
    is_active: p.isActive !== undefined ? p.isActive : true,
    product_description: p.productDescription || p.product_description || "",
    general_price: pricing.generalPrice ?? p.generalPrice ?? 0,
    wholesale_price: pricing.wholesalePrice ?? p.wholesalePrice ?? 0,
  };
};

const buildProductBody = (formData, companyId, userId) => ({
  companyUid: companyId,
  sizeText: Number(formData.measurement_value) || 0,
  measurementUid: formData.measurement_uid,
  productCode: formData.product_code,
  productName: formData.product_name,
  productDescription: formData.product_description || "",
  isActive: formData.is_active,
  createdBy: userId,
  generalPrice: formData.general_price ?? 0,
  wholesalePrice: formData.wholesale_price ?? 0,
  appUid: null,
});

export const useProducts = () => {
  const [products, setProducts] = useState(() => readProductsCache() || []);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsHasMore, setProductsHasMore] = useState(
    () => !readProductsCache(),
  );
  const [productsLoaded, setProductsLoaded] = useState(
    () => !!readProductsCache(),
  );

  const productsPageRef = useRef(0);
  const productsInFlightRef = useRef(false);
  const productsHasMoreRef = useRef(!readProductsCache());
  const productFetchesRef = useRef(new Map()); // uid -> Promise

  // Persist the product list to localStorage once the full list is loaded and
  // again on every subsequent mutation. While paginating, productsHasMore is
  // still true, so partial pages don't get cached.
  useEffect(() => {
    if (productsLoaded && !productsHasMore) {
      writeProductsCache(products);
    }
  }, [products, productsLoaded, productsHasMore]);

  const fetchProducts = useCallback(async () => {
    if (productsInFlightRef.current || !productsHasMoreRef.current) return;
    productsInFlightRef.current = true;
    setIsLoadingProducts(true);
    try {
      const session = getSession();
      const { items, last } = await fetchPage(
        `/api/v1/companies/${session.companyId}/products`,
        { page: productsPageRef.current },
      );
      const mapped = items.map(mapProduct);
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.product_uid));
        return [...prev, ...mapped.filter((p) => !seen.has(p.product_uid))];
      });
      productsPageRef.current += 1;
      productsHasMoreRef.current = !last;
      setProductsHasMore(!last);
      setProductsLoaded(true);
    } catch (e) {
      console.error("fetchProducts:", e);
    } finally {
      productsInFlightRef.current = false;
      setIsLoadingProducts(false);
    }
  }, []);

  const fetchAllProducts = useCallback(async () => {
    while (productsHasMoreRef.current) {
      const before = productsPageRef.current;
      await fetchProducts();
      if (productsPageRef.current === before) break;
    }
  }, [fetchProducts]);

  const ensureProduct = useCallback(async (uid) => {
    if (!uid) return null;
    if (productFetchesRef.current.has(uid)) {
      return productFetchesRef.current.get(uid);
    }
    const promise = (async () => {
      try {
        const session = getSession();
        const { data } = await api.get(
          `/api/v1/companies/${session.companyId}/products/${uid}`,
        );
        const mapped = mapProduct(data);
        setProducts((prev) => {
          if (prev.some((p) => p.product_uid === mapped.product_uid)) return prev;
          return [...prev, mapped];
        });
        return mapped;
      } catch (e) {
        console.error("ensureProduct:", e);
        productFetchesRef.current.delete(uid);
        return null;
      }
    })();
    productFetchesRef.current.set(uid, promise);
    return promise;
  }, []);

  const refreshProducts = useCallback(async () => {
    productsPageRef.current = 0;
    productsHasMoreRef.current = true;
    setProducts([]);
    setProductsHasMore(true);
    setProductsLoaded(false);
    await fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async (formData) => {
    const session = getSession();
    try {
      const { data } = await api.post(
        `/api/v1/companies/${session.companyId}/products/create`,
        buildProductBody(formData, session.companyId, session.userId),
      );
      const mapped = mapProduct(data);
      setProducts((prev) => [...prev, mapped]);
      return mapped;
    } catch (e) {
      console.error("addProduct:", e);
      throw e;
    }
  }, []);

  const updateProduct = useCallback(async (updatedProduct) => {
    const session = getSession();
    const uid = updatedProduct.product_uid;
    try {
      const { data } = await api.put(
        `/api/v1/companies/${session.companyId}/products/update/${uid}`,
        {
          ...buildProductBody(updatedProduct, session.companyId, session.userId),
          productUid: uid,
          modifiedBy: session.userId,
        },
      );
      const mapped = mapProduct(data);
      setProducts((prev) =>
        prev.map((p) => (p.product_uid === uid ? mapped : p)),
      );
      return mapped;
    } catch (e) {
      console.error("updateProduct:", e);
      throw e;
    }
  }, []);

  const disableProduct = useCallback(async (uid) => {
    const session = getSession();
    try {
      await api.put(
        `/api/v1/companies/${session.companyId}/products/update/${uid}/status/false`,
      );
      setProducts((prev) =>
        prev.map((p) =>
          p.product_uid === uid ? { ...p, is_active: false } : p,
        ),
      );
    } catch (e) {
      console.error("disableProduct:", e);
      throw e;
    }
  }, []);

  return {
    products,
    isLoadingProducts,
    productsHasMore,
    productsLoaded,
    fetchProducts,
    fetchAllProducts,
    ensureProduct,
    refreshProducts,
    addProduct,
    updateProduct,
    disableProduct,
  };
};
