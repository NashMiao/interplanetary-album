let uploadDialogVisible = false;

let uploadForm = {
    ontIdSelected: '',
    uploadPayAcctPass: '',
};

let selectPayer = async function () {
    await this.getAccounts();
    this.uploadDialogVisible = true;
};

let beforeImgUpload = async function (imgFile) {
    const isJPEG = imgFile.type === 'image/jpeg';
    const isPNG = imgFile.type === 'image/png';
    const isBMP = imgFile.type === 'image/bmp';
    const isLt10M = imgFile.size / 1024 / 1024 < 10;
    if (!(isJPEG || isPNG || isBMP)) {
        this.$message.error('Picture must be JPG/PNG/BMP format!');
    }
    if (!isLt10M) {
        this.$message.error('Picture size can not exceed 10MB!');
    }
    let url = Flask.url_for('is_default_wallet_account_unlock');
    try {
        let response = await axios.get(url);
        if (response.data.result === false) {
            await selectPayer();
        }
    } catch (error) {
        console.log(error);
    }
    return (isJPEG || isBMP || isPNG) && isLt10M;
};

let handleUploadSuccess = async function (res, file) {
    console.log(res);
    console.log(file);
    this.uploadPayAcctPass = '';
};

let handleUploadError = async function (res, file) {
    console.log(res);
    console.log(file);
    this.uploadPayAcctPass = '';
};