import api, { getSession, fetchPage } from "@/services/api";

// Vehicle day (Close Day), unloads, reasons and approvals — the backend's day-close endpoints.

const companyId = () => getSession()?.companyId;

// Reasons for a changed count, an unload or a return (status_elements rows)
export const REASON_NAMES = ["Damaged", "Expired", "Missing", "Wasted", "Warehouse", "Other"];

export const fetchReasons = async () => {
  const { data } = await api.get("/api/v1/deliwheels/status-elements");
  return (data || [])
    .filter((s) => REASON_NAMES.includes(s.statusText))
    .sort((a, b) => REASON_NAMES.indexOf(a.statusText) - REASON_NAMES.indexOf(b.statusText))
    .map((s) => ({ uid: s.statusUid, name: s.statusText }));
};

export const fetchVehicleDay = async (vehicleUid, date) => {
  const { data } = await api.get(`/api/v1/deliwheels/vehicle-days/company/${companyId()}/vehicle/${vehicleUid}`, {
    params: { date },
  });
  return data;
};

// counts: [{ productUid, countedQty, reasonUid, reasonNote }] — products left out keep their expected figure
export const closeVehicleDay = async (vehicleUid, date, counts) => {
  const { data } = await api.post(`/api/v1/deliwheels/vehicle-days/company/${companyId()}/vehicle/${vehicleUid}/close`, {
    date,
    counts,
  });
  return data;
};

export const correctCount = async (vehicleUid, date, productUid, countedQty, reasonUid, reasonNote) => {
  const { data } = await api.put(`/api/v1/deliwheels/vehicle-days/company/${companyId()}/vehicle/${vehicleUid}/count`, {
    date,
    productUid,
    countedQty,
    reasonUid,
    reasonNote,
  });
  return data;
};

export const fetchUnloads = async (vehicleUid, date) => {
  const { data } = await api.get(`/api/v1/deliwheels/unloads/company/${companyId()}/vehicle/${vehicleUid}`, {
    params: { date },
  });
  return data || [];
};

// Every unload of the company in a business-day range, all pages.
// filters: { vehicleUid, fromDate, toDate } (YYYY-MM-DD; the backend defaults to today)
export const fetchCompanyUnloads = async (filters = {}) => {
  const params = {};
  if (filters.vehicleUid) params.vehicleUid = filters.vehicleUid;
  if (filters.fromDate) params.fromDate = filters.fromDate;
  if (filters.toDate) params.toDate = filters.toDate;
  const all = [];
  let page = 0;
  let last = false;
  while (!last) {
    const result = await fetchPage(`/api/v1/deliwheels/unloads/company/${companyId()}`, { page, params });
    all.push(...result.items);
    last = result.last;
    page++;
  }
  return all;
};

export const fetchApprovals = async () => {
  const { data } = await api.get(`/api/v1/deliwheels/approvals/company/${companyId()}`);
  return data || { sales: [], returns: [], unloads: [] };
};

// Fired after an approval is accepted so the header bell refreshes its count
export const APPROVALS_CHANGED = "deliwheels:approvals-changed";

// kind: SALE / RETURN / UNLOAD
export const acceptApproval = async (kind, uid) => {
  await api.post(`/api/v1/deliwheels/approvals/${kind}/${uid}/accept`);
  window.dispatchEvent(new Event(APPROVALS_CHANGED));
};

export const fetchApprovalCount = async () => {
  const { sales = [], returns = [], unloads = [] } = await fetchApprovals();
  return sales.length + returns.length + unloads.length;
};

export const errorMessage = (e, fallback) => e?.response?.data?.message || fallback;
