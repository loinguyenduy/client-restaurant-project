import React, { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

const ProductImage = ({ src, alt, className = "" }) => {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError) {
    return (
      <div className={`product-image-fallback ${className}`} role="img" aria-label={`${alt} image unavailable`}>
        <ImageOff size={30} />
        <span>Image unavailable</span>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setHasError(true)} />;
};

export default ProductImage;
