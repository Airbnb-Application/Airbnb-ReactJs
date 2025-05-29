const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

function imageUpload(imageSrc, uploadPreset, tries = 3, nextTry = 2000) {
    return new Promise(async (resolve, reject) => {
        try {
            const uploadResponse = await cloudinary.uploader.upload(imageSrc, {
                upload_preset: uploadPreset,
                timeout: 100000,
            });
            resolve({
                publicId: uploadResponse.public_id,
                secureUrl: uploadResponse.secure_url,
            });
        } catch (error) {
            if (tries > 0) {
                console.log('Retrying upload...');
                setTimeout(() => {
                    resolve(imageUpload(imageSrc, uploadPreset, tries - 1, nextTry));
                }, nextTry);
            } else {
                console.log('Failed to upload image');
                console.log(error);
                reject(null);
            }
        }
    });
}

function imageDelete(publicId, tries = 3, nextTry = 2000) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await cloudinary.uploader.destroy(publicId, {
                resource_type: "image",
                type: "upload",
                timeout: 100000,
            });
            resolve(response);
        } catch (error) {
            if (tries > 0) {
                console.log('Retrying delete...');
                setTimeout(() => {
                    resolve(imageDelete(publicId, tries - 1, nextTry));
                }, nextTry);
            } else {
                console.log('Failed to delete image');
                console.log(error);
                reject(null);
            }
        }
    });
}

module.exports = {
    imageUpload,
    imageDelete,
}

// module.exports = {
//     imageUpload: async (imageSrc, uploadPreset, tries = 3, nextTry = 2000) => {
//         try {
//             const uploadResponse = await cloudinary.uploader.upload(imageSrc, {
//                 upload_preset: uploadPreset,
//                 timeout: 100000,
//             });
//             return {
//                 publicId: uploadResponse.public_id,
//                 secureUrl: uploadResponse.secure_url,
//             };
//         } catch (error) {
//             if (tries > 0) {
//                 console.log('Retrying upload...');
//                 setTimeout(() => {
//                     return module.exports.imageUpload(imageSrc, uploadPreset, tries - 1, nextTry);
//                 }, nextTry);
//             } else {
//                 console.log('Failed to upload image');
//                 console.log(error);
//                 return null;
//             }
//         }
//     },
//
//     imageDelete: async (publicId) => {
//         return await cloudinary.uploader.destroy(publicId, {
//             resource_type: "image",
//             type: "upload",
//             timeout: 100000,
//         });
//     }
// };
