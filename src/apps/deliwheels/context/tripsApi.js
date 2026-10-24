import { useEffect, useState } from "react";
import api, { getSession } from "@/services/api";

// Trips (settlement), Needs attention and releasing a vehicle from its phone — see nexo_backend/docs/trip-settlement.md

const companyId = () => getSession()?.companyId;

export const fetchUnsettledTrips = async () =>
  (await api.get(`/api/v1/deliwheels/trips/company/${companyId()}/unsettled`)).data || [];

export const settleTrip = async (tripUid, body) =>
  (await api.post(`/api/v1/deliwheels/trips/company/${companyId()}/${tripUid}/settle`, body)).data;

export const releaseVehicle = (vehicleUid) => api.post(`/api/v1/deliwheels/vehicles/${vehicleUid}/release-device`);

export const fetchOpenIssues = async () =>
  (await api.get(`/api/v1/deliwheels/sync-issues/company/${companyId()}`, { params: { open: true, size: 200 } })).data?.content || [];

export const markIssueSeen = (issueUid) =>
  api.post(`/api/v1/deliwheels/sync-issues/company/${companyId()}/${issueUid}/seen`);

// Badge: trips waiting for the admin to settle + records that need attention
export function useTripAttentionCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    Promise.all([fetchUnsettledTrips(), fetchOpenIssues()])
      .then(([trips, issues]) => {
        if (alive) setCount(trips.filter((t) => t.status === "Submitted").length + issues.length);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return count;
}
