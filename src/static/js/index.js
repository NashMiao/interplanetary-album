new Vue({
    el: '#vue-app',
    data: function () {
        return {
            visible: false,
            privateKeyDialogVisible: false,
            albumArray: [],
            newHexPrivateKey: '',
            eventInfoSelect: '',
            eventKey: '',
            assetSelect: '',
            assetKey: '',
            labelPosition: 'right',
            isSwitchToSettings: true,
            settingForm: {
                networkOptions: [{
                    value: 'MainNet',
                    label: 'Main Network',
                }, {
                    value: 'TestNet',
                    label: 'Polaris Test Network'
                }, {
                    value: 'Localhost',
                    label: 'Localhost 20336'
                }],
                networkSelected: ['TestNet'],
                accountOptions: [],
                accountSelected: [],
                b58AddressSelected: '',
                identityOptions: [],
                identitySelected: '',
                contractAddress: '',
                tokenName: ''
            }
        }
    },
    methods: {
        beforeImgUpload(imgFile) {
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
        },
        async viewOriginalImg(item) {
            window.open(_blank = item);
        },
        async getAlbumArray() {
            let url = Flask.url_for('get_album_array');
            try {
                let response = await axios.get(url);
                this.albumArray = response.data.result;
            } catch (error) {
                console.log(error);
            }
        },
        async tabClickHandler(tab, event) {
            if (tab.label === 'DApp Settings') {
                if (this.isSwitchToSettings === true) {
                    await this.getAccounts();
                    await this.getContractAddress();
                    await this.getTokenName();
                    this.isSwitchToSettings = false;
                    if (this.settingForm.accountSelected.length === 0 && this.settingForm.accountOptions.length !== 0) {
                        let firstB58Address = this.settingForm.accountOptions[0].value;
                        this.settingForm.accountSelected = [firstB58Address];
                        this.settingForm.b58AddressSelected = firstB58Address;
                    }
                }
            }
            else if (tab.label === 'Collapse Album') {
                this.isSwitchToSettings = true;
                await this.getAccounts();
                await this.getAlbumArray();
            }
            else if (tab.label === 'Card Album') {
                this.isSwitchToSettings = true;
                await this.getAccounts();
                await this.getAlbumArray();
            }
            else {
                this.isSwitchToSettings = true;
                console.log(tab);
            }
        },
        async queryBalance() {
            let query_balance_url = Flask.url_for("query_balance");
            let response = await axios.post(query_balance_url, {
                b58_address: this.assetKey,
                asset_select: this.assetSelect
            });
            this.$notify({
                title: 'Query Success',
                message: this.assetSelect.concat(' Balance: ', response.data.result),
                type: 'success'
            });
        },
        async getAccounts() {
            let url = Flask.url_for('get_accounts');
            let response = await axios.get(url);
            this.settingForm.accountOptions = [];
            for (let i = 0; i < response.data.result.length; i++) {
                this.settingForm.accountOptions.push({
                    value: response.data.result[i].b58_address,
                    label: response.data.result[i].label
                });
            }
        },
        async importAccount() {
            let hex_private_key = await this.$prompt('Paste your private key string here:', 'Import Account', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                inputPattern: /^[a-zA-Z0-9]{64}$/,
                inputErrorMessage: 'Cannot import invalid private key'
            }).catch(() => {
                this.$message.warning('Import canceled');
            });
            if (hex_private_key === undefined) {
                return;
            }
            let label = await this.$prompt('Account Label:', 'Import Account', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
            }).catch(() => {
                this.$message.warning('Import canceled');
            });
            if (label === undefined) {
                return;
            }
            let password = await this.$prompt('Account Password', 'Import Account', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                inputType: 'password',
            }).catch(() => {
                this.$message.warning('Import canceled');
            });
            if (password === undefined) {
                return;
            }
            try {
                let import_account_url = Flask.url_for('import_account');
                let import_account_response = await axios.post(import_account_url, {
                    'hex_private_key': hex_private_key.value,
                    'label': label.value,
                    'password': password.value
                });
                await this.getAccounts();
                this.$message.success({
                    message: 'Import successful',
                    duration: 1200
                });
            }
            catch (error) {
                if (error.response.status === 409) {
                    this.$message({
                        message: error.response.data.result,
                        type: 'error',
                        duration: 2400
                    })
                }
            }
        },
        async removeAccount() {
            let password = '';
            try {
                password = await this.$prompt('Account Password', 'Remove Default Account', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    inputPattern: /\S{1,}/,
                    inputType: 'password',
                    inputErrorMessage: 'invalid password'
                });
                password = password.value;
            } catch (error) {
                this.$message({
                    message: 'remove account canceled',
                    type: 'warning',
                    duration: 800
                });
            }
            try {
                let remove_account_url = Flask.url_for('remove_account');
                let response = await axios.post(remove_account_url, {
                    password: password,
                    b58_address_remove: this.settingForm.accountSelected[0],
                });
                await this.getAccounts();
                if (this.settingForm.accountSelected.length === 0 && this.settingForm.accountOptions.length !== 0) {
                    let firstB58Address = this.settingForm.accountOptions[0].value;
                    this.settingForm.accountSelected = [firstB58Address];
                    this.settingForm.b58AddressSelected = firstB58Address;
                }
                console.log(response);
                this.$message({
                    message: response.data.result,
                    type: 'success',
                    duration: 2400
                });
            } catch (error) {
                this.$message({
                    message: error.response.data.result,
                    type: 'error',
                    duration: 2400
                })
            }
        },
        async createAccount() {
            let label = await this.$prompt('Account Label:', 'Import Account', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                inputPattern: /\S{1,}/,
                inputErrorMessage: 'invalid label'
            }).catch(() => {
                this.$message.warning('Import canceled');
            });
            if (label === undefined) {
                return;
            }
            let password = await this.$prompt('Account Password', 'Import Account', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                inputPattern: /\S{1,}/,
                inputType: 'password',
                inputErrorMessage: 'invalid password'
            }).catch(() => {
                this.$message.warning('Import canceled');
            });
            if (password === undefined) {
                return;
            }
            try {
                let create_account_url = Flask.url_for('create_account');
                let response = await axios.post(create_account_url, {
                    'label': label.value,
                    'password': password.value
                });
                this.newHexPrivateKey = response.data.hex_private_key;
                this.privateKeyDialogVisible = true;
                await this.getAccounts();
            } catch (error) {
                console.log(error);
            }
        },
        async accountChange(value) {
            try {
                let url = Flask.url_for('account_change');
                let response = await axios.post(url, {'b58_address_selected': value[0]});
                this.settingForm.b58AddressSelected = value[0];
                this.$message({
                    type: 'success',
                    message: response.data.result,
                    duration: 1200
                });
            }
            catch (error) {
                this.$message({
                    message: error.response.data.result,
                    type: 'error',
                    duration: 2400
                })
            }
        },
        async identityChange(value) {
            try {
                let url = Flask.url_for('identity_change');
                let responsed = await axios.post(url, {'identitySelected': value[0]});
                this.settingForm.identitySelected = value[0];
                this.$message({
                    message: response.data.result,
                    duration: 1200
                })
            } catch (error) {
                this.$message({
                    message: error.response.data.result,
                    type: 'error',
                    duration: 2400
                })
            }
        },
        async getContractAddress() {
            let url = Flask.url_for('get_contract_address');
            let response = await axios.get(url);
            this.settingForm.contractAddress = response.data.result;
        },
        async queryEvent() {
            if (this.eventInfoSelect === "") {
                this.$notify({
                    title: 'Query Event Error',
                    type: 'warning',
                    message: 'Please select an event information you want to query.',
                    duration: 800
                });
                return;
            }
            if (this.eventKey.length === 0) {
                this.$notify({
                    title: 'TxHash Error',
                    type: 'error',
                    message: 'Please input TxHash',
                    duration: 800
                });
                return;
            }
            if (this.eventKey.length === 64) {
                let get_smart_contract_event_url = Flask.url_for("get_smart_contract_event");
                try {
                    let response = await axios.post(get_smart_contract_event_url, {
                        tx_hash: this.eventKey,
                        event_info_select: this.eventInfoSelect
                    });
                    let result = response.data.result;
                    if (result.length === 0) {
                        this.$message({
                            message: 'query failed!',
                            type: 'error',
                            duration: 800
                        })
                    }
                    else {
                        if (this.eventInfoSelect === 'Notify') {
                            this.$alert(result, 'Query Result', {
                                confirmButtonText: 'OK',
                                type: 'success'
                            });
                        } else {
                            this.$notify({
                                title: 'Query Result',
                                type: 'success',
                                message: result,
                                duration: 0
                            });
                        }
                    }
                }
                catch (error) {
                    this.$message({
                        message: 'query failed!',
                        type: 'error',
                        duration: 800
                    });
                }
            }
        },
        async networkChange(value) {
            let msg = '';
            if (value[0] === 'MainNet') {
                msg = 'Connecting to Main Network'
            }
            else if (value[0] === 'TestNet') {
                msg = 'Connecting to Polaris Test Network'
            }
            else if (value[0] === 'Localhost') {
                msg = 'Connecting to Localhost'
            }
            else {
                return
            }
            let change_net_url = Flask.url_for('change_net');
            try {
                let response = await axios.post(change_net_url, {
                    network_selected: value[0]
                });
                this.$notify({
                    title: 'Network Change',
                    type: 'success',
                    message: msg,
                    duration: 2000
                });
            } catch (error) {
                this.settingForm.networkSelected = ['TestNet'];
                if (error.response.status === 400) {
                    this.$notify({
                        title: 'Network Change',
                        type: 'warning',
                        message: error.response.data.result,
                        duration: 2000
                    })
                }
                else if (error.response.status === 409) {
                    this.$notify({
                        title: 'Network Change',
                        type: 'warning',
                        message: error.response.data.result,
                        duration: 2000
                    })
                }
                else if (error.response.status === 500) {
                    this.$notify({
                        title: 'Network Change',
                        type: 'warning',
                        message: error.response.data.result,
                        duration: 2000
                    })
                }
                else if (error.response.status === 501) {
                    this.$notify({
                        title: 'Network Change',
                        type: 'warning',
                        message: error.response.data.result,
                        duration: 2000
                    })
                }
                else {
                    this.$notify({
                        title: 'Network Change',
                        type: 'error',
                        message: 'Failed',
                        duration: 2000
                    })
                }
            }
        },
        async changeContract() {
            let hex_contract_address = await this.$prompt('Paste your oep4 contract address here:', 'Change Contract', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                inputPattern: /^[a-zA-Z0-9]{40}$/,
                inputErrorMessage: 'Cannot handle invalid contract address'
            }).catch(() => {
                this.$message.warning('Import canceled');
            });
            try {
                let change_contract_url = Flask.url_for('set_contract_address');
                let response = await axios.post(change_contract_url, {
                    'contract_address': hex_contract_address
                });
                this.$message({
                    type: 'success',
                    message: 'change contract address successful!',
                    duration: 2000
                });
                await this.getContractAddress();
            } catch (error) {
                console.log(error);
            }
        },
    }
});
