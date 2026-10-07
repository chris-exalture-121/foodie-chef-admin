import React, { useEffect, useState } from "react";
import ReusableTable from "../../../components/table";
import { useFetchClient } from "@strapi/admin/strapi-admin";
import Spinner from "../../../components/Spinner";

const normalizeKitchens = (kitchens) => {
  return kitchens.map((k) => ({
    id: k.id,
    name: k.name,
    address: k.address,
    latitude: k.latitude ? Number(k.latitude) : null,
    longitude: k.longitude ? Number(k.longitude) : null,
    user: k.user?.name,
    approvalStatus: k.approvalStatus,
    caption: k.caption || "-",
    licenseNumber: k.licenseNumber,
    licenseProvider: k.licenseProvider ?? "",
    averageRating: Number(k.averageRating ?? 0),
    deliveryPartnerId: k.deliveryPartnerId ?? "",
  }));
};

const KitchensPage = () => {
  const [kitchens, setKitchens] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [currentKitchenId, setCurrentKitchenId] = useState(null);
  const [partnerIdInput, setPartnerIdInput] = useState("");

  const { get, post } = useFetchClient();

  const loadKitchens = async () => {
    setLoading(true);
    try {
      const res = await get("/api/kitchen");
      setKitchens(normalizeKitchens(res?.data.data || []));
    } catch (err) {
      console.error("Error loading kitchens:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (kitchen) => {
    const newStatus =
      kitchen.approvalStatus === "approved" ? "pending" : "approved";
    await post("/api/kitchen/update-approval-status", {
      kitchenId: kitchen.id,
      approvalStatus: newStatus,
    });
    loadKitchens();
  };

  const openAssignModal = (kitchen) => {
    setCurrentKitchenId(kitchen.id);
    setPartnerIdInput(kitchen.deliveryPartnerId || "");
    setShowModal(true);
  };

  const assignDeliveryPartner = async () => {
    if (!partnerIdInput || !currentKitchenId) return;

    await post("/api/kitchen", {
      kitchenId: currentKitchenId,
      deliveryPartnerId: partnerIdInput,
    });

    setShowModal(false);
    setCurrentKitchenId(null);
    setPartnerIdInput("");
    loadKitchens();
  };

  useEffect(() => {
    loadKitchens();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        height: "100vh",
        color: "#fff",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ marginBottom: "20px", fontSize: "28px" }}>Kitchens</h1>

      <div
        style={{
          height: "calc(100% - 100px)",
          overflowY: "hidden",
          borderRadius: "8px",
          padding: "10px",
          backgroundColor: "#1e1e1e",
        }}
      >
        {loading ? (
          <Spinner />
        ) : (
          <ReusableTable
            data={kitchens}
            renderAction={(row) => (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => toggleApproval(row)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    backgroundColor:
                      row.approvalStatus === "approved" ? "#ff4d4f" : "#4caf50",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "14px",
                    boxSizing: "border-box",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.85)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
                >
                  {row.approvalStatus === "approved" ? "Revoke" : "Approve"}
                </button>

                <button
                  onClick={() => openAssignModal(row)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    backgroundColor: "#1890ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "14px",
                    boxSizing: "border-box",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Assign Partner
                </button>
              </div>
            )}
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#1f1f1f",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "300px",
            }}
          >
            <h2 style={{ marginBottom: "15px" }}>Assign Delivery Partner</h2>
            <input
              type="text"
              value={partnerIdInput}
              onChange={(e) => setPartnerIdInput(e.target.value)}
              placeholder="Enter Delivery Partner ID"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "4px",
                border: "1px solid #333",
                marginBottom: "15px",
                background: "#2a2a2a",
                color: "#fff",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#555",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={assignDeliveryPartner}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#4caf50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchensPage;
