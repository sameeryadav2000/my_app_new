"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import SellerDialog from "@/app/dash_components/SellerDialog";
import { SellerData } from "@/app/dash_components/SellerDialog";
import SellerCard from "@/app/dash_components/SellerCard";

interface Seller {
  id: string;
  businessName: string;
  phone: string;
  isActive: boolean;
  name: string;
  email: string;
  createdAt: string;
  address: string;
  taxId: string;
}

export default function SellersPage() {
  const { showLoading, hideLoading } = useLoading();
  const { showSuccess, showError, showDeleteConfirmation } = useNotification();

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentSeller, setCurrentSeller] = useState<Seller | null>(null);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        showLoading();

        const response = await fetch("/dash_api/sellers");
        const result = await response.json();

        if (!result.success) {
          showError("Error", result.message);
          return;
        }

        setSellers(result.data || []);
      } catch (error) {
        showError("Error", "Failed to load sellers. Please try again.");
      } finally {
        hideLoading();
      }
    };

    fetchSellers();
  }, []);

  const openDialog = (editMode = false, seller: Seller | null = null) => {
    setIsEditMode(editMode);
    setCurrentSeller(seller);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setCurrentSeller(null);
  };

  const handleSaveSeller = async (formData: SellerData) => {
    try {
      showLoading();

      const method = isEditMode ? "PUT" : "POST";
      const endpoint = isEditMode ? `/dash_api/sellers?id=${currentSeller?.id}` : "/dash_api/sellers";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        showError("Error", result.message);
        return;
      }

      if (isEditMode) {
        setSellers(sellers.map((seller) => (seller.id === currentSeller?.id ? result.data : seller)));
        showSuccess("Success", result.message);
      } else {
        setSellers([...sellers, result.data]);
        showSuccess("Success", result.message);
      }
    } catch (error) {
      showError("Error", `Failed to ${isEditMode ? "update" : "save"} seller. Please try again.`);
    } finally {
      hideLoading();
    }
  };

  const handleEditSeller = (id: string) => {
    const sellerToEdit = sellers.find((seller) => seller.id === id);
    if (sellerToEdit) {
      openDialog(true, sellerToEdit);
    }
  };

  const handleDeleteSeller = (id: string) => {
    const performDelete = async () => {
      try {
        showLoading();
        debugger;

        const response = await fetch(`/dash_api/sellers?id=${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!result.success) {
          showError("Error", result.message);
          return;
        }

        setSellers(sellers.filter((seller) => seller.id !== id));
      } catch (error) {
        showError("Error", "Failed to delete seller. Please try again.");
      } finally {
        hideLoading();
      }
    };

    showDeleteConfirmation("Confirm Deletion", `Are you sure you want to delete this item? This action cannot be undone.`, performDelete);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Sellers</h1>

        <button
          onClick={() => openDialog()}
          className="flex items-center px-4 py-2.5 bg-black text-white rounded-md hover:bg-[#333333] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#555555] focus:ring-offset-2"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          <span>Add Seller</span>
        </button>
      </div>

      <div className="bg-white border border-[#e0e0e0] rounded-md shadow-sm p-6">
        {sellers.length > 0 ? (
          <div className="space-y-4">
            {sellers.map((seller) => (
              <SellerCard key={seller.id} seller={seller} onEdit={handleEditSeller} onDelete={handleDeleteSeller} />
            ))}
          </div>
        ) : (
          <p className="text-[#999999] text-center py-8">No sellers found. Add your first seller to get started.</p>
        )}
      </div>

      {isDialogOpen && <SellerDialog isOpen={isDialogOpen} onClose={closeDialog} onSave={handleSaveSeller} sellerToEdit={currentSeller} />}
    </div>
  );
}
