import { useRef, useState } from "react";
import { TbPhotoPlus } from "react-icons/tb";

const ImageUpload = (props) => {
  const { value, onChange } = props;

  const [preview, setPreview] = useState();
  const fileInputRef = useRef(null);
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    TransformDataType(file);
  }

  const TransformDataType = (file) => {
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        onChange(reader.result);
      };
    } else {
      onChange(null);
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={(e) => {
            // onChange(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
            handleImageUpload(e);
        }}
      />
      <div
        // onClick={() => widgetRef.current.open()}
        onClick={() => handleUploadClick()}
        className="relative cursor-pointer hover:opacity-70 transition border-dashed border-2 p-20 border-neutral-300 flex flex-col justify-center items-center gap-4 text-neutral-600 h-full"
      >
        <TbPhotoPlus size={50} />
        <div className="font-semibold text-lg">Click to Upload</div>
        {value && (
          <div
            className="
              absolute inset-0"
          >
            <img
              className="object-cover w-full h-full"
              src={preview}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ImageUpload;
