import { useToast } from "@chakra-ui/react";
import { useState } from "react";
import Resizer from "react-image-file-resizer";

// maximum allowed size for avatar images (in bytes)
const MAX_SIZE_AVATAR = 800 * 1024; // 800 KB

export default function useImagePreview(keepOriginalImg = false) {
    const [imgUrl, setImgUrl] = useState(null);
    const toast = useToast();

    const handleImageChange = async (e) => {
        const file = e.target.files[0];

        if (file && file.type.startsWith("image/")) {
            if (keepOriginalImg) {
                if (file.size <= MAX_SIZE_AVATAR) {
                    const reader = new FileReader();

                    reader.onloadend = () => {
                        setImgUrl(reader.result);
                    };

                    reader.readAsDataURL(file);
                } else {
                    toast({
                        title: "Избраният файл е твърде голям",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                    setImgUrl(null);
                }
            } else {
                try {
                    // Resize the image while maintaining aspect ratio
                    const resizedImage = await resizeFile(file);

                    if (resizedImage.size <= MAX_SIZE_AVATAR) {
                        const reader = new FileReader();

                        reader.onloadend = () => {
                            setImgUrl(reader.result);
                        };

                        reader.readAsDataURL(resizedImage);
                    } else {
                        toast({
                            title: "Избраният файл е твърде голям",
                            status: "error",
                            duration: 6000,
                            isClosable: true,
                            position: "bottom",
                        });
                        setImgUrl(null);
                    }
                } catch (error) {
                    console.error("Error resizing the image", error);
                    toast({
                        title: "Грешка при обработка на изображението",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                    setImgUrl(null);
                }
            }
        } else {
            toast({
                title: "Невалиден файлов формат",
                status: "error",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });
            setImgUrl(null);
        }
    };

    const resizeFile = (file) =>
        new Promise((resolve) => {
            Resizer.imageFileResizer(
                file,
                200, // maximum width
                200, // maximum height
                "JPEG",
                80, // quality
                0, // rotation
                (uri) => {
                    resolve(uri);
                },
                "file",
                true // maintain aspect ratio
            );
        });

    const setImage = (image) => {
        setImgUrl(image);
    };

    return { handleImageChange, imgUrl, setImage };
}
