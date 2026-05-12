import React, { useState, useEffect } from "react";
import NexoLayout from "../components/NexoLayout";
import ProductSection from "../components/ProductSection";
import ProductFormModal from "./modals/products/ProductFormModal";
import ProductDetailModal from "./modals/products/ProductDetailModal";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import { Plus, Search } from "lucide-react";
import { useGlobal } from "../context/GlobalContext";
import useInfiniteScroll from "@shared/hooks/useInfiniteScroll";
import useFreshItems from "@shared/hooks/useFreshItems";
import useStickyFlag from "@shared/hooks/useStickyFlag";
import InfiniteScrollLoader from "@shared/components/ui/InfiniteScrollLoader";

const ProductsPage = () => {
  const {
    products,
    isLoadingProducts,
    productsHasMore,
    productsLoaded,
    fetchProducts,
    addProduct,
    updateProduct,
    disableProduct,
    measurements,
    fetchMeasurements,
  } = useGlobal();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (!productsLoaded) fetchProducts();
    fetchMeasurements();
  }, [productsLoaded, fetchProducts, fetchMeasurements]);

  const sentinelRef = useInfiniteScroll({
    hasMore: productsHasMore,
    isLoading: isLoadingProducts,
    onLoadMore: fetchProducts,
  });

  const isFreshProduct = useFreshItems(products.map((p) => p.product_uid));
  const showLoader = useStickyFlag(
    isLoadingProducts && products.length > 0,
    700,
  );

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleDisable = async (uid) => {
    await disableProduct(uid);
    setSelectedProduct(null);
  };

  const matchesSearch = (p) =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product_code.toLowerCase().includes(searchTerm.toLowerCase());

  const activeProducts = products.filter(
    (p) => p.is_active && matchesSearch(p),
  );
  const inactiveProducts = products.filter(
    (p) => !p.is_active && matchesSearch(p),
  );

  return (
    <NexoLayout
      headerTitle="Products"
      headerSubtitle="Manage product catalog and specifications"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: "700",
              letterSpacing: "-0.02em",
            }}
          >
            Products
          </h2>
          <p style={{ color: "var(--color-text-subtle)" }}>
            Manage product catalog and specifications.
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: "8px" }} />
          Add Product
        </Button>
      </div>

      <Card padding="md" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div style={{ position: "relative" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-subtle)",
            }}
          />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 10px 10px 36px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              outline: "none",
              fontSize: "var(--text-sm)",
            }}
          />
        </div>
      </Card>

      {isLoadingProducts && products.length === 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "var(--spacing-lg)",
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} padding="lg">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <Skeleton width="48px" height="48px" borderRadius="12px" />
                <Skeleton width="60px" height="24px" borderRadius="12px" />
              </div>
              <Skeleton
                width="70%"
                height="24px"
                style={{ marginBottom: "8px" }}
              />
              <Skeleton
                width="50%"
                height="16px"
                style={{ marginBottom: "16px" }}
              />
              <Skeleton width="30%" height="16px" />
            </Card>
          ))}
        </div>
      )}

      {!(isLoadingProducts && products.length === 0) && (
        <>
          <ProductSection
            title="Active Products"
            products={activeProducts}
            emptyMessage="No active products found."
            onCardClick={setSelectedProduct}
            isFreshProduct={isFreshProduct}
            style={{ marginBottom: "var(--spacing-xl)" }}
          />
          <ProductSection
            title="Inactive Products"
            products={inactiveProducts}
            emptyMessage="No inactive products."
            onCardClick={setSelectedProduct}
            isFreshProduct={isFreshProduct}
            style={{ marginBottom: "var(--spacing-xl)" }}
          />

          <div ref={sentinelRef} style={{ height: "1px" }} />
          {showLoader && <InfiniteScrollLoader />}
        </>
      )}

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialProduct={editingProduct}
        measurements={measurements}
        onAdd={addProduct}
        onUpdate={updateProduct}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onEdit={handleEditClick}
        onDisable={handleDisable}
      />
    </NexoLayout>
  );
};

export default ProductsPage;
