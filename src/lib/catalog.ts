import { cache } from "react";
import { prisma } from "@/lib/db";

export type PackSummary = {
  id: string;
  slug: string;
  name: string;
  quantity: number;
  priceCop: number;
  compareAtCop: number | null;
  badge: string | null;
  description: string | null;
  stock: number;
  productName: string;
  productSlug: string;
  image: string;
};

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  volumeMl: number;
  sku: string;
  stock: number;
  imageFront: string;
  imageBack: string | null;
  imageAngle: string | null;
};

function packImage(quantity: number, images: { front: string; back: string | null; angle: string | null }) {
  if (quantity >= 3 && images.back) return images.back;
  if (quantity === 2 && images.angle) return images.angle;
  return images.front;
}

export const getCatalog = cache(async () => {
  const product = await prisma.product.findFirst({
    where: { active: true },
    orderBy: { createdAt: "asc" },
    include: {
      packs: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) return null;

  const images = {
    front: product.imageFront,
    back: product.imageBack,
    angle: product.imageAngle,
  };

  const packs: PackSummary[] = product.packs.map((pack) => ({
    id: pack.id,
    slug: pack.slug,
    name: pack.name,
    quantity: pack.quantity,
    priceCop: pack.priceCop,
    compareAtCop: pack.compareAtCop,
    badge: pack.badge,
    description: pack.description,
    stock: product.stock,
    productName: product.name,
    productSlug: product.slug,
    image: packImage(pack.quantity, images),
  }));

  const detail: ProductDetail = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    volumeMl: product.volumeMl,
    sku: product.sku,
    stock: product.stock,
    imageFront: product.imageFront,
    imageBack: product.imageBack,
    imageAngle: product.imageAngle,
  };

  return { product: detail, packs };
});

export type Catalog = NonNullable<Awaited<ReturnType<typeof getCatalog>>>;

export const getApprovedReviews = cache(async (productId: string) => {
  const reviews = await prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    orderBy: { publishedAt: "desc" },
    take: 12,
  });
  const aggregate = await prisma.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const distribution = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId, status: "APPROVED" },
    _count: { _all: true },
  });

  return {
    reviews,
    average: aggregate._avg.rating ?? 0,
    count: aggregate._count._all,
    distribution: [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: distribution.find((item) => item.rating === rating)?._count._all ?? 0,
    })),
  };
});

export const getPublishedTestimonials = cache(async () => {
  return prisma.testimonial.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    take: 9,
  });
});
