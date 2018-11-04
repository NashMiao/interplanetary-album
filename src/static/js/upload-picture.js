let beforeImgUpload = function (imgFile) {
    const isJPEG = imgFile.type === 'image/jpeg';
    const isJPG = imgFile.type === 'image/jpg';
    const isPNG = imgFile.type === 'image/png';
    const isBMP = imgFile.type === 'image/bmp';
    const isLt10M = imgFile.size / 1024 / 1024 < 10;

    if (!isJPEG || !isJPG || !isPNG || !isBMP) {
        this.$message.error('Picture must be JPG/PNG/BMP format!');
    }
    if (!isLt10M) {
        this.$message.error('Picture size can not exceed 10MB!');
    }
    return (isJPG || isJPG || isBMP || isPNG) && isLt10M;
};