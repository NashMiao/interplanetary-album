new Vue({
    el: '#vue-app',
    data: function () {
        return {
            loginDialogVisible: true,
            loginForm: {
                pass: ''
            },
            settingForm: {
                identityOptions: [],
                identitySelected: [],
                ontIdSelected: '',
            }
        }
    },
    methods: {
        reloadLoginPage() {
            location.reload()
        },
        async getIdentities() {
            try {
                let url = Flask.url_for('get_identities');
                let response = await axios.get(url);
                this.settingForm.identityOptions = [];
                for (let i = 0; i < response.data.result.length; i++) {
                    this.settingForm.identityOptions.push({
                        value: response.data.result[i].ont_id,
                        label: response.data.result[i].label
                    });
                }
            }
            catch (error) {
                console.log(error);
            }
        },
        async createIdentity() {
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
                let create_identity_url = Flask.url_for('create_identity');
                let response = await axios.post(create_identity_url, {
                    'label': label.value,
                    'password': password.value
                });
                this.settingForm.newIdentityHexPrivateKey = response.data.hex_private_key;
                this.settingForm.newIdentityPrivateKeyDialogVisible = true;
                await this.getIdentities();
            } catch (error) {
                console.log(error);
            }
        },
        async identityChange(value) {
            try {
                let url = Flask.url_for('identity_change');
                let response = await axios.post(url, {'ont_id_selected': value[0]});
                this.settingForm.ontIdSelected = value[0];
                this.$message({
                    type: 'success',
                    message: response.data.result,
                    duration: 1200
                })
            } catch (error) {
                console.log(error);
                this.$message({
                    message: error.response.data.result,
                    type: 'error',
                    duration: 2400
                })
            }
        }
    },
    created() {
        this.getIdentities();
    }
});