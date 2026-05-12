import { useCallback, useState } from "react";
import api from "@/services/api";

export const mapMeasurement = (m) => ({
  measurement_uid: m.measurementUid || m.measurement_uid,
  measurement_text: m.measurementText || m.measurement_text || "",
  measurement_code: m.measurementCode || m.measurement_code || "",
});

export const useMeasurements = () => {
  const [measurements, setMeasurements] = useState([]);
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(false);
  const [isMeasurementsLoaded, setIsMeasurementsLoaded] = useState(false);

  const fetchMeasurements = useCallback(async () => {
    if (isMeasurementsLoaded) return;
    setIsLoadingMeasurements(true);
    try {
      const { data } = await api.get(`/api/v1/measurements`);
      setMeasurements((data.content || data).map(mapMeasurement));
      setIsMeasurementsLoaded(true);
    } catch (e) {
      console.error("fetchMeasurements:", e);
    } finally {
      setIsLoadingMeasurements(false);
    }
  }, [isMeasurementsLoaded]);

  return {
    measurements,
    isLoadingMeasurements,
    fetchMeasurements,
  };
};
