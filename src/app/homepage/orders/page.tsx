"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Spacer from "@/app/components/Spacer";
import Link from "next/link";

interface OrderStatus {
  status: "Ordered" | "Preparing" | "Shipped" | "Delivered";
  date: string;
  isComplete: boolean;
}

interface Order {
  id: string;
  product: string;
  image: string;
  statuses: OrderStatus[];
  currentStatus: string;
  shippingEstimate?: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "3352995",
      product: "iPhone XS 256GB - Gold - Fully unlocked (GSM & CDMA)",
      image: "../../../../iphone_images/image.png",
      currentStatus: "Delivered",
      statuses: [
        { status: "Ordered", date: "9/18/2022", isComplete: true },
        { status: "Preparing", date: "9/18/2022", isComplete: true },
        { status: "Shipped", date: "9/20/2022", isComplete: true },
        { status: "Delivered", date: "9/21/2022", isComplete: true }
      ],
      shippingEstimate: "Estimate"
    },
    {
      id: "3352996",
      product: "iPhone 14 Pro - Graphite - Unlocked",
      image: "../../../../iphone_images/image.png",
      currentStatus: "Shipped",
      statuses: [
        { status: "Ordered", date: "2/20/2025", isComplete: true },
        { status: "Preparing", date: "2/21/2025", isComplete: true },
        { status: "Shipped", date: "2/22/2025", isComplete: true },
        { status: "Delivered", date: "2/25/2025", isComplete: false }
      ],
      shippingEstimate: "Estimate"
    }
  ]);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login_signup");
    }
  }, [status, router]);

  // Function to determine which circles to fill based on status
  const getStatusIndex = (order: Order, status: string) => {
    const index = order.statuses.findIndex(s => s.status === status);
    return index;
  };

  return (
    <div className="w-4/5 mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      <Spacer />
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Order # {order.id}</p>
                  <h2 className="text-lg font-medium">{order.product}</h2>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-black text-white px-4 py-2 rounded-lg">
                    Get help
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-24 h-auto">
                  <img 
                    src={order.image} 
                    alt={order.product} 
                    className="w-full h-auto object-contain"
                  />
                </div>
                
                <div className="flex-1">
                  {/* Order Timeline */}
                  <div className="mb-4 relative">
                    <div className="flex justify-between items-center">
                      {order.statuses.map((status, index) => (
                        <div key={index} className="flex flex-col items-center w-full">
                          <div className={`h-4 w-4 rounded-full border-2 ${
                            status.isComplete ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'
                          }`}></div>
                          <p className="text-sm font-medium mt-2">{status.status}</p>
                          <p className="text-xs text-gray-500">{status.date}</p>
                          {status.status === "Shipped" && order.shippingEstimate && (
                            <p className="text-xs text-gray-400">{order.shippingEstimate}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Progress Line */}
                    <div className="absolute top-2 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
                    
                    {/* Filled Progress Line */}
                    <div 
                      className="absolute top-2 left-0 h-0.5 bg-green-600 -z-10"
                      style={{ 
                        width: `${(getStatusIndex(order, order.currentStatus) / (order.statuses.length - 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Link 
                  href="#"
                  className="inline-block border border-gray-300 rounded-lg px-4 py-2 text-sm"
                >
                  Proof of purchase
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}