import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import ProductModel from "@/models/product.model";
export async function POST(request: NextRequest) {
  const products = Array.from({ length: 20 }).map(() => ({
    name: faker.commerce.productName(),
    price: faker.commerce.price(),
    image: faker.image.url({ width: 200, height: 200 }),
    description: faker.commerce.productDescription(),
    category: faker.commerce.department(),
    rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
    stock: faker.number.int({ min: 0, max: 100 }),
    brand: faker.company.name(),
  }));

  const addedProducts = await ProductModel.insertMany(products);
  if (!addedProducts) {
    return NextResponse.json(
      { error: "Failed to add products" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Products added successfully", products: addedProducts },
    { status: 200 }
  );
}
