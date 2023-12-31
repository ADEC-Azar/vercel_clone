'use client';

import clsx from 'clsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import LoadingDots from 'components/loading-dots';
import { VercelProductVariant as ProductVariant } from 'lib/bigcommerce/types';

export function AddToCart({
  variants,
  availableForSale
}: {
  variants: ProductVariant[];
  availableForSale: boolean;
}) {
  const productEntityId = variants[0]?.parentId;
  const varianEntitytId = variants[0]?.id;
  const [selectedVariantId, setSelectedVariantId] = useState(varianEntitytId);
  const [selectedProductId, setSelectedProductId] = useState(productEntityId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const variant = variants.find((variant: ProductVariant) =>
      variant.selectedOptions.every(
        (option) => option.value === searchParams.get(option.name.toLowerCase())
      )
    );

    if (variant) {
      setSelectedVariantId(variant.id);
      setSelectedProductId(variant.parentId);
    }
  }, [searchParams, variants, setSelectedVariantId]);

  const isMutating = adding || isPending;

  async function handleAdd() {
    if (!availableForSale) return;

    setAdding(true);

    const response = await fetch(`/api/cart`, {
      method: 'POST',
      body: JSON.stringify({
        merchandiseId: selectedVariantId,
        productId: selectedProductId,
        isBigCommerceAPI: true
      })
    });

    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    setAdding(false);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <button
      aria-label="Add item to cart"
      disabled={isMutating}
      onClick={handleAdd}
      className={clsx(
        'flex w-full items-center justify-center bg-black p-4 text-sm uppercase tracking-wide text-white opacity-90 hover:opacity-100 dark:bg-white dark:text-black',
        {
          'cursor-not-allowed opacity-60': !availableForSale,
          'cursor-not-allowed': isMutating
        }
      )}
    >
      <span>{availableForSale ? 'Add To Cart' : 'Out Of Stock'}</span>
      {isMutating ? <LoadingDots className="bg-white dark:bg-black" /> : null}
    </button>
  );
}
