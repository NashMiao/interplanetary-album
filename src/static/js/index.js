new Vue({
    el: '#vue-app',
    data: function () {
        return {
            labelPosition: 'right',
            unlockDialogVisible: true,
            isSwitchToSettings: true,
            albumArray: [],
            eventInfoSelect: eventInfoSelect,
            eventKey: eventKey,
            assetSelect: assetSelect,
            assetKey: assetKey,
            settingForm: settingForm
        }
    },
    methods: {
        beforeImgUpload: beforeImgUpload,
        viewOriginalImg: viewOriginalImg,
        shareIpfsAddress: shareIpfsAddress,
        getAccounts: getAccounts,
        queryBalance: queryBalance,
        queryEvent: queryEvent,
        getIdentities: getIdentities,
        importAccount: importAccount,
        removeAccount: removeAccount,
        createAccount: createAccount,
        clearNewAccountHexPrivateKey: clearNewAccountHexPrivateKey,
        clearNewIdentityHexPrivateKey: clearNewIdentityHexPrivateKey,
        createIdentity: createIdentity,
        importIdentity: importIdentity,
        removeIdentity: removeIdentity,
        accountChange: accountChange,
        identityChange: identityChange,
        networkChange: networkChange,
        changeContract: changeContract,
        getContractAddress: getContractAddress,
        async unlockIdentityAccount() {

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
                    await this.getIdentities();
                    await this.getContractAddress();
                    this.isSwitchToSettings = false;
                    if (this.settingForm.accountSelected.length === 0 && this.settingForm.accountOptions.length !== 0) {
                        let firstB58Address = this.settingForm.accountOptions[0].value;
                        this.settingForm.accountSelected = [firstB58Address];
                        this.settingForm.b58AddressSelected = firstB58Address;
                    }
                    if (this.settingForm.identitySelected.length === 0 && this.settingForm.identityOptions.length !== 0) {
                        let firstOntId = this.settingForm.identityOptions[0].value;
                        this.settingForm.identitySelected = [firstOntId];
                        this.settingForm.ontIdSelected = firstOntId;
                    }
                }
            }
            else if (tab.label === 'Collapse Album') {
                this.isSwitchToSettings = true;
                await this.getAccounts();
                await this.getIdentities();
                await this.getAlbumArray();
            }
            else if (tab.label === 'Card Album') {
                this.isSwitchToSettings = true;
                await this.getAccounts();
                await this.getIdentities();
                await this.getAlbumArray();
            }
            else {
                this.isSwitchToSettings = true;
            }
        }
    },
    async created() {
        await this.getAlbumArray();
    }
});
