let settingForm =  {
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
                newAccountHexPrivateKey: '',
                newAccountPrivateKeyDialogVisible: false,
                newIdentityPrivateKeyDialogVisible: false,
                newIdentityHexPrivateKey: '',
                networkSelected: ['TestNet'],
                accountOptions: [],
                accountSelected: [],
                b58AddressSelected: '',
                identityOptions: [],
                identitySelected: [],
                ontIdSelected: '',
                contractAddress: '',
                tokenName: ''
            }


let  viewOriginalImg=async function(item) {
            window.open(_blank = item);
        }