import { FiMail, FiPhone, FiCalendar, FiEdit2, FiTrash2, FiUser, FiFileText } from "react-icons/fi";

interface SellerCardProps {
  seller: {
    id: string;
    businessName: string;
    phone: string;
    isActive: boolean;
    name: string;
    email: string;
    createdAt: string;
    taxId: string; // Add taxId to the seller interface
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SellerCard({ seller, onEdit, onDelete }: SellerCardProps) {
  const formattedDate = new Date(seller.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Get initials for the placeholder image
  const getInitials = () => {
    const businessInitial = seller.businessName.charAt(0);
    const nameInitial = seller.name.charAt(0);
    return `${businessInitial}${nameInitial}`.toUpperCase();
  };

  return (
    <div className="bg-white border border-[#e0e0e0] rounded-lg shadow-sm p-6 mb-5 hover:shadow transition-shadow duration-300">
      <div className="flex flex-wrap md:flex-nowrap items-center">
        {/* Profile Image (Placeholder) */}
        <div className="w-full md:w-1/6 mb-4 md:mb-0 flex justify-center md:justify-start">
          <div className="w-16 h-16 bg-[#f0f0f0] rounded-full flex items-center justify-center overflow-hidden">
            {/* You can replace this with an actual image if available */}
            {/* <img src="/api/placeholder/64/64" alt={seller.businessName} className="w-full h-full object-cover" /> */}
            <div className="flex items-center justify-center w-full h-full bg-[#e0e0e0] text-[#555555] text-xl font-bold">
              {getInitials()}
            </div>
          </div>
        </div>

        {/* Business Name and Status Badge */}
        <div className="w-full md:w-1/3 mb-4 md:mb-0 md:pr-6">
          <div className="flex items-center flex-wrap mb-1">
            <h3 className="text-xl font-bold text-black truncate mr-3">{seller.businessName}</h3>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                seller.isActive ? "bg-[#ebf7f0] text-[#1e8a4c]" : "bg-[#fdf1f1] text-[#d63939]"
              }`}
            >
              {seller.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-[#666666] text-sm font-medium">{seller.name}</p>

          {/* Add Tax ID below name */}
          <div className="flex items-center text-[#666666] mt-1">
            <div className="bg-[#f5f5f5] p-1 rounded-md mr-2">
              <FiFileText className="w-3 h-3 text-[#555555]" />
            </div>
            <span className="text-xs">Tax ID: {seller.taxId}</span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <div className="grid grid-cols-1 gap-y-2">
            <div className="flex items-center text-[#666666]">
              <div className="bg-[#f5f5f5] p-2 rounded-md mr-3">
                <FiMail className="w-4 h-4 text-[#555555]" />
              </div>
              <span className="truncate">{seller.email}</span>
            </div>
            <div className="flex items-center text-[#666666]">
              <div className="bg-[#f5f5f5] p-2 rounded-md mr-3">
                <FiPhone className="w-4 h-4 text-[#555555]" />
              </div>
              <span className="truncate">{seller.phone}</span>
            </div>
            <div className="flex items-center text-[#666666]">
              <div className="bg-[#f5f5f5] p-2 rounded-md mr-3">
                <FiCalendar className="w-4 h-4 text-[#555555]" />
              </div>
              <span>Added on {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full md:w-1/6 flex justify-end md:border-l md:border-[#f0f0f0] md:pl-6">
          <button
            onClick={() => onEdit(seller.id)}
            className="flex items-center px-4 py-2 mr-3 text-sm bg-[#f5f5f5] text-[#444444] rounded-md hover:bg-[#e9e9e9] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#dddddd] focus:ring-offset-2"
          >
            <FiEdit2 className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => onDelete(seller.id)}
            className="flex items-center px-4 py-2 text-sm bg-[#fff2f2] text-[#d63939] rounded-md hover:bg-[#ffe5e5] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffcccc] focus:ring-offset-2"
          >
            <FiTrash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
