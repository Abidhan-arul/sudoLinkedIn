import React, { useEffect, useState } from "react";

interface AuthImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imageUrl: string;
  token: string;
}

const AuthImage: React.FC<AuthImageProps> = ({ imageUrl, token, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl || !token) return;
    let isMounted = true;
    fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include", // Only if your backend uses cookies
    })
      .then((res) => {
        if (!res.ok) throw new Error("Image fetch failed");
        return res.blob();
      })
      .then((blob) => {
        if (isMounted) {
          setImgSrc(URL.createObjectURL(blob));
        }
      })
      .catch(() => setImgSrc(null));
    return () => {
      isMounted = false;
      if (imgSrc) URL.revokeObjectURL(imgSrc);
    };
    // eslint-disable-next-line
  }, [imageUrl, token]);

  if (!imgSrc) return <div>Loading image...</div>;
  return <img src={imgSrc} alt={alt || "profile"} {...props} />;
};

export default AuthImage; 