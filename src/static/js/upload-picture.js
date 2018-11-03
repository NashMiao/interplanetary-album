let beforeImgUpload = function (imgFile) {
    const isJPG = file.type === 'image/jpeg';
    const isPNG = file.type === 'image/png';
    const isBMP = file.type === 'image/bmp';
    const isLt10M = file.size / 1024 / 1024 < 10;

    if (!isJPG || !isPNG || !isBMP) {
        this.$message.error('Picture must be JPG/PNG/BMP format!');
    }
    if (!isLt10M) {
        this.$message.error('Picture size can not exceed 10MB!');
    }
    return (isJPG || isBMP || isPNG) && isLt10M;
};