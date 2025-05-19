"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DeliveryPartner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  experience: number;
  isAvailable: boolean;
  averageRating: number;
  totalRatings: number;
  isVerified: boolean;
  createdAt: string;
}

export default function DeliveryPartnersTable() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveryPartners = async () => {
      try {
        const response = await fetch("/api/admin/delivery-partners");
        if (!response.ok) throw new Error("Failed to fetch delivery partners");

        const data = await response.json();
        setPartners(data);
      } catch (error) {
        console.error("Error fetching delivery partners:", error);
        toast("Error", {
          description: "Failed to load delivery partners",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryPartners();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getVehicleTypeName = (type: string) => {
    const types = {
      bike: "Bike",
      scooter: "Scooter",
      car: "Car",
      van: "Van",
      other: "Other",
    } as Record<string, string>;

    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        Loading delivery partners...
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No delivery partners found
                </TableCell>
              </TableRow>
            ) : (
              partners.map((partner) => (
                <TableRow key={partner._id}>
                  <TableCell className="font-medium">
                    {partner.name}
                    {!partner.isVerified && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {partner.phone} <br />
                    <span className="text-xs text-gray-500">
                      {partner.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getVehicleTypeName(partner.vehicleType)} <br />
                    <span className="text-xs text-gray-500">
                      {partner.vehicleNumber}
                    </span>
                  </TableCell>
                  <TableCell>{partner.experience} years</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        partner.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {partner.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span>
                        {partner.averageRating.toFixed(1)} (
                        {partner.totalRatings})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(partner.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
