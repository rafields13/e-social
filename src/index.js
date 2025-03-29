var app = angular.module("myApp", ["ui.utils.masks", "ngFileUpload"]);

app.controller("MyCtrl", function ($scope, $timeout, $document, CountriesService, StreetTypeService, AlertService) {
    // page initialization
    $timeout(async function () {
        $scope.states = await getStates();
        $scope.countries = CountriesService.getCountries();
        $scope.streetTypes = StreetTypeService.getStreetTypes();
        $scope.$applyAsync();
    });

    // vars initialization
    $scope.mandatory = false;
    $scope.user = {
        isPwd: true,
        birthState: {},
        birthCity: {},
        naturalness: '',
        nationality: {},
        state: {},
        city: {},
        contracts: [
            {
                grantorCnpj: "00394684000153",
                initialRegistration: '',
                internshipStartDate: '',
                internshipNature: 'N',
                requestId: "98041",
                document: {
                    documentFile: {},
                    documentType: '',
                    documentDescription: ''
                },
                documents: [],
                recess: {},
                recesses: [],
                rescission: {},
                rescissions: [],
            },
        ],
    };
    $scope.countries = [];
    $scope.states = [];
    $scope.cities = [];
    $scope.streetTypes = [];
    $scope._ = _; // lodash library
    $scope.mode = "initial";
    $scope.showUpdateMenu = false;
    $scope.showDepartmentDropdown = false;
    $scope.selectedDepartment = {
        name: "Central IT",
        id: 13,
        isLDAP: false
    };
    $scope.searchDepartment = '';
    $scope.departments = [
        {
            name: "Órgão 1",
            id: 1,
            isLDAP: false
        },
        {
            name: "Órgão 2",
            id: 2,
            isLDAP: true
        },
        {
            name: "Órgão 3",
            id: 3,
            isLDAP: false
        },
        {
            name: "Órgão 4",
            id: 4,
            isLDAP: true
        },
        {
            name: "Central IT",
            id: 13,
            isLDAP: false
        }
    ];
    $scope.users = [
        {
            name: "Rafael Marliere de Oliveira",
            email: "rafael.marliere@centralit.com.br",
        }
    ];
    $scope.isAccordionOpen = {
        "intern": false,
        "address": false,
        "contact": false,
    };

    $scope.switchMode = function (mode) {
        $scope.mode = mode;
    };

    $scope.checkCloseUpdateDropdown = function () {
        $timeout(function () {
            var isMouseOverButton = document.querySelector('.update-button:hover');
            var isMouseOverMenu = document.querySelector('.update-dropdown:hover');

            if (!isMouseOverButton && !isMouseOverMenu) {
                $scope.showUpdateMenu = false;
            }
        }, 100);
    };

    $scope.toggleDepartmentDropdown = function () {
        $scope.showDepartmentDropdown = !$scope.showDepartmentDropdown;
    };

    $document.on('click', function (event) {
        var isInsideMenu = event.target.closest('.relative');
        if (!isInsideMenu) {
            $scope.$apply(function () {
                $scope.showDepartmentDropdown = false;
            });
        }
    });

    $scope.selectDepartment = function (department) {
        $scope.selectedDepartment = department;
        $scope.showDepartmentDropdown = false;
    };

    $scope.toggleAccordion = function (ref) {
        $scope.isAccordionOpen[ref] = !$scope.isAccordionOpen[ref];
    };

    $scope.openModal = function (id) {
        let body = document.querySelector("body");
        let modal = document.getElementById(id);
        let content = document.getElementById(id + "Content");

        body.classList.add("overflow-hidden");

        modal.classList.remove("opacity-0", "scale-95", "pointer-events-none");
        modal.classList.add("opacity-100", "scale-100", "pointer-events-auto");

        requestAnimationFrame(() => {
            content.classList.remove("opacity-0", "scale-95");
            content.classList.add("opacity-100", "scale-100");
        });
    };

    $scope.closeModal = function (id, contractIndex) {
        let body = document.querySelector("body");
        let modal = document.getElementById(id);
        let content = document.getElementById(id + "Content");

        body.classList.remove("overflow-hidden");

        content.classList.remove("opacity-100", "scale-100");
        content.classList.add("opacity-0", "scale-95");

        setTimeout(() => {
            modal.classList.remove("opacity-100", "scale-100", "pointer-events-auto");
            modal.classList.add("opacity-0", "scale-95", "pointer-events-none");
        }, 300);

        if (contractIndex !== undefined) {
            $scope.user.contracts[contractIndex].document = {};
            $scope.$applyAsync();
        }
    };

    $scope.submitForm = function (event) {
        event.preventDefault();
        console.log("Form submitted");
        console.log(event);
    };

    $scope.getCEP = async function (cep) {
        if (cep && cep.length === 8) {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

            if (!res.ok) {
                return;
            }

            const data = await res.json();

            if (res.status === 200 && !data.erro) {
                let stateAcronym = data.uf;
                let cityName = data.localidade;

                $scope.user.streetDescription = data.logradouro;
                $scope.user.neighborhood = data.bairro;
                $scope.user.state = $scope.states.find(
                    s => s.sigla === stateAcronym
                );
                getCities($scope.user.state.id).then(cities => {
                    $scope.user.city = cities.find(
                        c => c.nome === cityName
                    );

                    $scope.$applyAsync();
                });
            }
        }
    }

    const getStates = async function () {
        const res = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");

        if (!res.ok) {
            return;
        }

        const data = await res.json();

        if (res.status === 200) {
            return data;
        }
    };

    const getCities = async function (stateId) {
        const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios?orderBy=nome`);

        if (!res.ok) {
            return;
        }

        const data = await res.json();

        if (res.status === 200) {
            return data;
        }
    }

    $scope.$watch("user.nationality", function (newNationality) {
        if (_.isObject(newNationality) && !_.isEmpty(newNationality)) {
            $scope.user.birthState = {};
            $scope.user.birthCity = {};
            $scope.user.naturalness = '';

            if (newNationality.id !== 105) {
                $scope.hideBirthStateCity = true;
                $scope.user.naturalness = "Estrangeiro";
            } else {
                $scope.hideBirthStateCity = false;
            }
        }
    }, true);

    $scope.$watch("user.birthState", async function (newState) {
        if (_.isObject(newState) && !_.isEmpty(newState)) {
            $scope.user.birthCity = {};
            $scope.user.naturalness = '';
            $scope.cities = await getCities(newState.id);
        }
    }, true);

    $scope.$watch("user.birthCity", function (newCity) {
        if (
            _.isObject(newCity)
            && !_.isEmpty(newCity)
            && _.isObject($scope.user.birthState)
            && !_.isEmpty($scope.user.birthState)
        ) {
            $scope.user.naturalness = `${newCity.nome} - ${$scope.user.birthState.sigla}`;
        }
    }, true);

    $scope.updateInitialRegistration = function (contract) {
        if (contract && contract.internshipStartDate) {
            const initialRegistrationDate = new Date("2024-10-01");
            const internshipDate = new Date(contract.internshipStartDate);

            contract.initialRegistration = internshipDate < initialRegistrationDate
                ? 'S'
                : 'N';
        }
    };

    $scope.lettersAndSpacesPattern = function (event, allowedNumbers = false) {
        let pattern;
        let char = String.fromCharCode(event.which);

        if (allowedNumbers) {
            pattern = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s-/]+$/;
        } else {
            pattern = /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/;
        }

        if (!pattern.test(char)) {
            event.preventDefault();
        }
    };

    $scope.handleFileUpload = function (contractIndex, event) {
        const file = event.target.files[0];

        if (file) {
            $scope.user.contracts[contractIndex].document.documentFile = file;
            $scope.$apply();
        }
    };

    async function getOptions() {
        const res = await fetch('/config');

        if (!res.ok) {
            throw new Error('Erro ao buscar configurações do ambiente');
        }

        const options = await res.json();
        return options;
    }

    async function generateToken() {
        const {
            baseUrl,
            realm,
            grantType,
            clientId,
            username,
            password
        } = await getOptions();

        const url = `https://${baseUrl}/auth/realms/${realm}/protocol/openid-connect/token`;

        const formData = new URLSearchParams();
        formData.append('grant_type', grantType);
        formData.append('client_id', clientId);
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Erro ao gerar token: ${err}`);
        }

        const data = await response.json();
        return data.access_token;
    }

    function getUuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async function sendDocumentToServer(doc) {
        const token = await generateToken();

        const documentDescription = doc.documentDescription;
        const containerId = getUuid();
        const uuid = getUuid();

        const formData = new FormData();
        formData.append("file", doc.documentFile);

        const url = `https://portalservicos.economia.df.gov.br/lowcode/document/upload` +
            `?documentDescription=${documentDescription}` +
            `&containerId=${containerId}` +
            `&uuid=${uuid}`;

        const res = await fetch(url, {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();
        return data;
    }

    $scope.downloadDocument = async function (doc) {
        if (_.isObject(doc) && !_.isEmpty(doc)) {
            const token = await generateToken();
            const url = `https://portalservicos.economia.df.gov.br/lowcode/document/download?uuid=${doc.serverDocumentId}`;

            const res = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) {
                AlertService.error("Erro ao baixar o documento. Verifique se o documento existe ou se você tem permissão para acessá-lo.");
                return;
            }

            const blob = await res.blob();
            const urlBlob = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = urlBlob;
            a.download = doc.documentFile.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(urlBlob);
            return;
        }

        AlertService.error("Erro ao baixar o documento. Verifique se o documento existe ou se você tem permissão para acessá-lo.");
        return;
    };

    $scope.saveSelectedDocument = async function (doc, contractIndex) {
        if (!_.isObject(doc) || _.isEmpty(doc)) return;

        if (!doc.documentFile || !doc.documentFile.name) {
            AlertService.info("Selecione um arquivo para o documento");
            return;
        }

        if (!doc.documentType) {
            AlertService.info("Informe o tipo do documento");
            return;
        }

        if (!doc.documentDescription) {
            AlertService.info("Informe a descrição do documento");
            return;
        }

        const contract = $scope.user.contracts[contractIndex];

        const docInServer = await sendDocumentToServer(doc);

        if (!docInServer?.id) {
            AlertService.error("Erro ao tentar salvar o documento. Verifique se o arquivo é válido e tente novamente.");
            return;
        }

        const documentData = {
            documentDescription: doc.documentDescription,
            documentType: doc.documentType,
            serverDocumentId: docInServer.id,
            documentFile: doc.documentFile
        };

        const idx = contract.editingDocumentIndex;

        if (idx !== undefined) {
            contract.documents[idx] = documentData;
            delete contract.editingDocumentIndex;
        } else {
            contract.documents.push(documentData);
        }

        contract.document = {};
        $scope.closeModal("uploadDocumentModal");
        AlertService.success("Documento salvo com sucesso!");
        $scope.$applyAsync();
    };

    $scope.editDocument = function (contractIndex, docIndex) {
        const contract = $scope.user.contracts[contractIndex];
        const doc = contract.documents[docIndex];

        contract.editingDocumentIndex = docIndex;

        contract.document = {
            documentType: doc.documentType,
            documentDescription: doc.documentDescription,
            serverDocumentId: doc.serverDocumentId,
            documentFile: doc.documentFile
        };

        $scope.openModal("uploadDocumentModal");
    };

    $scope.deleteDocument = async function (contractIndex, docIndex) {
        const confirmed = await AlertService.confirm("Tem certeza que deseja excluir este documento?");
        if (!confirmed) return;

        const contract = $scope.user.contracts[contractIndex];

        if (contract && contract.documents && contract.documents.length > docIndex) {
            contract.documents.splice(docIndex, 1);
            AlertService.success("Documento removido com sucesso!");
            $scope.$applyAsync();
        } else {
            AlertService.error("Erro ao tentar remover o documento. Tente novamente.");
        }
    };
}).directive('cpfValidator', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            ctrl.$parsers.push(function (value) {
                if (!value) {
                    ctrl.$setValidity('cpf', false);
                    element[0].setCustomValidity("O CPF é obrigatório");
                    return value;
                }

                let cpf = value.replace(/\D/g, '');

                if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
                    ctrl.$setValidity('cpf', false);
                    element[0].setCustomValidity("CPF inválido! Verifique o número digitado.");
                    return value;
                }

                let sum = 0, remainder;
                for (let i = 1; i <= 9; i++) sum += parseInt(cpf[i - 1]) * (11 - i);
                remainder = (sum * 10) % 11;
                if (remainder === 10 || remainder === 11) remainder = 0;
                if (remainder !== parseInt(cpf[9])) {
                    ctrl.$setValidity('cpf', false);
                    element[0].setCustomValidity("CPF inválido! Verifique o número digitado.");
                    return value;
                }

                sum = 0;
                for (let i = 1; i <= 10; i++) sum += parseInt(cpf[i - 1]) * (12 - i);
                remainder = (sum * 10) % 11;
                if (remainder === 10 || remainder === 11) remainder = 0;
                if (remainder !== parseInt(cpf[10])) {
                    ctrl.$setValidity('cpf', false);
                    element[0].setCustomValidity("CPF inválido! Verifique o número digitado.");
                    return value;
                }

                ctrl.$setValidity('cpf', true);
                element[0].setCustomValidity("");
                return value;
            });
        }
    };
}).directive('cnpjValidator', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            ctrl.$parsers.push(function (value) {
                if (!value) {
                    ctrl.$setValidity('cnpj', false);
                    element[0].setCustomValidity("O CNPJ é obrigatório");
                    return value;
                }

                let cnpj = value.replace(/\D/g, '');

                if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
                    ctrl.$setValidity('cnpj', false);
                    element[0].setCustomValidity("CNPJ inválido! Verifique o número digitado.");
                    return value;
                }

                function validarDigito(cnpj, weights, position) {
                    let sum = 0;
                    for (let i = 0; i < weights.length; i++) {
                        sum += parseInt(cnpj[i]) * weights[i];
                    }
                    let remainder = sum % 11;
                    let digit = remainder < 2 ? 0 : 11 - remainder;
                    return parseInt(cnpj[position]) === digit;
                }

                let weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
                let weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

                if (!validarDigito(cnpj, weights1, 12) || !validarDigito(cnpj, weights2, 13)) {
                    ctrl.$setValidity('cnpj', false);
                    element[0].setCustomValidity("CNPJ inválido! Verifique o número digitado.");
                    return value;
                }

                ctrl.$setValidity('cnpj', true);
                element[0].setCustomValidity("");
                return value;
            });
        }
    };
}).directive('cepValidator', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            ctrl.$parsers.push(function (value) {
                if (!value) {
                    ctrl.$setValidity('cep', false);
                    element[0].setCustomValidity("O CEP é obrigatório");
                    return value;
                }

                let cep = value.replace(/\D/g, '');

                if (cep.length !== 8) {
                    ctrl.$setValidity('cep', false);
                    element[0].setCustomValidity("CEP inválido! Verifique o número digitado.");
                    return value;
                }

                ctrl.$setValidity('cep', true);
                element[0].setCustomValidity("");
                return value;
            });
        }
    };
}).directive('ageValidator', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            let minAge = parseInt(attrs.minAge) || 16;

            ctrl.$parsers.push(function (value) {
                if (!value) {
                    ctrl.$setValidity('age', false);
                    element[0].setCustomValidity("A data de nascimento é obrigatória.");
                    return value;
                }

                let birthDate = new Date(value);
                let today = new Date();

                let age = today.getFullYear() - birthDate.getFullYear();
                let monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                if (age < minAge) {
                    ctrl.$setValidity('age', false);
                    element[0].setCustomValidity(`A idade mínima para estágio é ${minAge} anos.`);
                } else {
                    ctrl.$setValidity('age', true);
                    element[0].setCustomValidity("");
                }

                return value;
            });
        }
    };
}).directive('searchableDropdown', function () {
    return {
        restrict: 'E',
        scope: {
            options: '=',
            selected: '=',
            placeholder: '@',
            formRequired: '=',
            formId: '@',
            formName: '@',
        },
        template: `
            <div class="relative w-full">
                <input type="text" ng-model="searchText"
                    id="{{ formId }}"
                    name="{{ formName }}"
                    class="p-2 border border-[#C9C9C9] rounded-sm focus:outline-none h-10 w-full pr-8"
                    placeholder="{{ placeholder }}"
                    ng-required="formRequired"
                    ng-focus="showDropdown = true"
                    ng-blur="hideDropdown()"
                    ng-keydown="onKeydown($event)"
                    ng-keypress="lettersAndSpacesPattern($event)" />
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" 
                    class="absolute right-0 top-1/2 transform -translate-y-1/2 transition duration-200">
                    <path d="M5.83331 8.33333L9.99998 12.5L14.1666 8.33333" 
                        stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
                <div class="absolute z-10 bg-white border border-gray-300 w-full max-h-40 mt-1 overflow-y-auto rounded-sm"
                    ng-show="showDropdown">
                    <div ng-repeat="option in filteredOptions = (options | filter:searchText) track by option.id"
                        ng-click="selectOption(option)"
                        class="p-2 cursor-pointer hover:bg-[#1967d2] hover:text-white">
                        {{ (formId === 'birthState' && option.sigla) ? option.sigla + ' - ' + option.nome : option.nome }}
                    </div>
                    <div ng-if="filteredOptions.length === 0" class="p-2 text-gray-500">Nenhuma opção encontrada</div>
                </div>
            </div>
        `,
        link: function (scope) {
            scope.showDropdown = false;

            scope.selectOption = function (option) {
                scope.selected = option;
                scope.searchText = (scope.formId === 'birthState' && option.sigla) ? option.sigla + ' - ' + option.nome : option.nome;
                scope.showDropdown = false;
            };

            scope.hideDropdown = function () {
                setTimeout(() => {
                    scope.$apply(() => {
                        scope.showDropdown = false;
                    });
                }, 200);
            };

            scope.onKeydown = function (event) {
                if (event.key === "Escape") {
                    scope.showDropdown = false;
                }
            };

            scope.$watch("selected", function (newSelected) {
                if (newSelected && Object.keys(newSelected).length === 0) {
                    scope.searchText = '';
                }
            }, true);

            scope.lettersAndSpacesPattern = function (event) {
                let char = String.fromCharCode(event.which);
                let pattern = /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/;

                if (!pattern.test(char)) {
                    event.preventDefault();
                }
            };
        }
    };
}).service('CountriesService', function () {
    this.getCountries = function () {
        return [
            {
                "id": 8,
                "nome": "Abu Dhabi",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 9,
                "nome": "Dirce",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 13,
                "nome": "Afeganistão",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 15,
                "nome": "Aland, Ilhas",
                "creationDate": "2015-12-07",
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 17,
                "nome": "Albânia, República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 20,
                "nome": "Alboran-Perejil, Ilhas",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 23,
                "nome": "Alemanha",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 25,
                "nome": "Alemanha, República Democrática",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 31,
                "nome": "Burkina Faso",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 37,
                "nome": "Andorra",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 40,
                "nome": "Angola",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 41,
                "nome": "Anguilla",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 42,
                "nome": "Antártica",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 43,
                "nome": "Antígua e Barbuda",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 47,
                "nome": "Antilhas Holandesas",
                "creationDate": null,
                "extinctionDate": "2018-04-30"
            },
            {
                "id": 53,
                "nome": "Arábia Saudita",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 59,
                "nome": "Argélia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 63,
                "nome": "Argentina",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 64,
                "nome": "Armênia, República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 65,
                "nome": "Aruba",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 69,
                "nome": "Austrália",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 72,
                "nome": "Áustria",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 73,
                "nome": "Azerbaijão, República do",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 77,
                "nome": "Bahamas, Ilhas",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 80,
                "nome": "Bahrein, Ilhas",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 81,
                "nome": "Bangladesh",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 83,
                "nome": "Barbados",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 85,
                "nome": "Belarus, República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 87,
                "nome": "Bélgica",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 88,
                "nome": "Belize",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 90,
                "nome": "Bermudas",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 93,
                "nome": "Mianmar (Birmânia)",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 97,
                "nome": "Bolívia, Estado Plurinacional da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 98,
                "nome": "Bósnia-Herzegovina, República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 99,
                "nome": "Bonaire, Saint Eustatius e Saba",
                "creationDate": "2015-12-07",
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 100,
                "nome": "Int. Z. F. Manaus",
                "creationDate": "1991-12-01",
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 101,
                "nome": "Botsuana",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 102,
                "nome": "Bouvet, Ilha",
                "creationDate": "2015-12-07",
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 105,
                "nome": "Brasil",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 106,
                "nome": "Fretado p\/ Brasil",
                "creationDate": "1991-12-01",
                "extinctionDate": "1996-11-14"
            },
            {
                "id": 108,
                "nome": "Brunei",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 111,
                "nome": "Bulgária, República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 115,
                "nome": "Burundi",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 119,
                "nome": "Butão",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 127,
                "nome": "Cabo Verde, República de",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 131,
                "nome": "Cachemira",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 137,
                "nome": "Cayman, Ilhas",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 141,
                "nome": "Camboja",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 145,
                "nome": "Camarões",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 149,
                "nome": "Canadá",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 150,
                "nome": "Ilhas do Canal (Jersey e Guernsey)",
                "creationDate": null,
                "extinctionDate": "2018-04-30"
            },
            {
                "id": 151,
                "nome": "Canárias, Ilhas",
                "creationDate": null,
                "extinctionDate": "2018-04-30"
            },
            {
                "id": 152,
                "nome": "Canal, Ilhas",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 153,
                "nome": "Cazaquistão, República do",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 154,
                "nome": "Catar",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 158,
                "nome": "Chile",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 160,
                "nome": "China, República Popular da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 161,
                "nome": "Formosa (Taiwan)",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 163,
                "nome": "Chipre",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 165,
                "nome": "Cocos (Keeling), Ilhas",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 169,
                "nome": "Colômbia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 173,
                "nome": "Comores, Ilhas",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 177,
                "nome": "Congo",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 183,
                "nome": "Cook, Ilhas",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 187,
                "nome": "Coreia (do Norte), Rep. Pop. Democrática da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 190,
                "nome": "Coreia (do Sul), República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 193,
                "nome": "Costa do Marfim",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 195,
                "nome": "Croácia, República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 196,
                "nome": "Costa Rica",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 198,
                "nome": "Kuwait",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 199,
                "nome": "Cuba",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 200,
                "nome": "Curacao",
                "creationDate": "2015-12-07",
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 229,
                "nome": "Benim",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 232,
                "nome": "Dinamarca",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 235,
                "nome": "Dominica, Ilha",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 237,
                "nome": "Dubai",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 239,
                "nome": "Equador",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 240,
                "nome": "Egito",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 243,
                "nome": "Eritreia",
                "creationDate": "2006-07-17",
                "extinctionDate": null
            },
            {
                "id": 244,
                "nome": "Emirados Árabes Unidos",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 245,
                "nome": "Espanha",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 246,
                "nome": "Eslovênia, República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 247,
                "nome": "Eslovaca, República",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 249,
                "nome": "Estados Unidos",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 251,
                "nome": "Estônia, República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 253,
                "nome": "Etiópia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 255,
                "nome": "Falkland (Ilhas Malvinas)",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 259,
                "nome": "Feroe, Ilhas",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 263,
                "nome": "Fezzan",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 267,
                "nome": "Filipinas",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 271,
                "nome": "Finlândia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 275,
                "nome": "França",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 281,
                "nome": "Gabão",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 285,
                "nome": "Gâmbia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 289,
                "nome": "Gana",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 291,
                "nome": "Geórgia, República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 292,
                "nome": "Geórgia do Sul e Sandwich do Sul, Ilhas",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 293,
                "nome": "Gibraltar",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 297,
                "nome": "Granada",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 301,
                "nome": "Grécia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 305,
                "nome": "Groenlândia",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 309,
                "nome": "Guadalupe",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 313,
                "nome": "Guam",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 317,
                "nome": "Guatemala",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 321,
                "nome": "Guernsey",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 325,
                "nome": "Guiana Francesa",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 329,
                "nome": "Guiné",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 331,
                "nome": "Guiné Equatorial",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 334,
                "nome": "Guiné-Bissau",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 337,
                "nome": "Guiana",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 341,
                "nome": "Haiti",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 343,
                "nome": "Heard e Ilhas McDonald, Ilha",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 345,
                "nome": "Honduras",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 351,
                "nome": "Hong Kong",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 355,
                "nome": "Hungria, República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 357,
                "nome": "Iêmen",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 358,
                "nome": "Iêmen do Sul",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 359,
                "nome": "Man, Ilha de",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 361,
                "nome": "Índia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 365,
                "nome": "Indonésia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 367,
                "nome": "Inglaterra",
                "creationDate": null,
                "extinctionDate": "1997-03-18"
            },
            {
                "id": 369,
                "nome": "Iraque",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 372,
                "nome": "Irã, República Islâmica do",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 375,
                "nome": "Irlanda",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 379,
                "nome": "Islândia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 383,
                "nome": "Israel",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 386,
                "nome": "Itália",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 388,
                "nome": "Sérvia e Montenegro",
                "creationDate": null,
                "extinctionDate": "2013-11-21"
            },
            {
                "id": 391,
                "nome": "Jamaica",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 393,
                "nome": "Jersey",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 395,
                "nome": "Jammu",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 396,
                "nome": "Johnston, Ilhas",
                "creationDate": null,
                "extinctionDate": "2018-04-30"
            },
            {
                "id": 399,
                "nome": "Japão",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 403,
                "nome": "Jordânia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 411,
                "nome": "Kiribati",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 420,
                "nome": "Laos, Rep. Pop. Democrática do",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 423,
                "nome": "Lebuan, Ilhas",
                "creationDate": null,
                "extinctionDate": "2018-04-30"
            },
            {
                "id": 426,
                "nome": "Lesoto",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 427,
                "nome": "Letônia, República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 431,
                "nome": "Líbano",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 434,
                "nome": "Libéria",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 438,
                "nome": "Líbia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 440,
                "nome": "Liechtenstein",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 442,
                "nome": "Lituânia, República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 445,
                "nome": "Luxemburgo",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 447,
                "nome": "Macau",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 449,
                "nome": "Macedônia do Norte",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 450,
                "nome": "Madagascar",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 452,
                "nome": "Ilha da Madeira",
                "creationDate": null,
                "extinctionDate": "2018-04-30"
            },
            {
                "id": 455,
                "nome": "Malásia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 458,
                "nome": "Malavi",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 461,
                "nome": "Maldivas",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 464,
                "nome": "Mali",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 467,
                "nome": "Malta",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 472,
                "nome": "Marianas do Norte",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 474,
                "nome": "Marrocos",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 476,
                "nome": "Marshall, Ilhas",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 477,
                "nome": "Martinica",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 485,
                "nome": "Maurício",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 488,
                "nome": "Mauritânia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 489,
                "nome": "Mayotte",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 490,
                "nome": "Midway, Ilhas",
                "creationDate": null,
                "extinctionDate": "2018-04-30"
            },
            {
                "id": 493,
                "nome": "México",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 494,
                "nome": "Moldávia, República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 495,
                "nome": "Mônaco",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 497,
                "nome": "Mongólia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 498,
                "nome": "Montenegro",
                "creationDate": "2006-06-03",
                "extinctionDate": null
            },
            {
                "id": 499,
                "nome": "Micronésia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 501,
                "nome": "Montserrat, Ilhas",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 505,
                "nome": "Moçambique",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 507,
                "nome": "Namíbia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 508,
                "nome": "Nauru",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 511,
                "nome": "Christmas, Ilha (Navidad)",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 517,
                "nome": "Nepal",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 521,
                "nome": "Nicarágua",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 525,
                "nome": "Níger",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 528,
                "nome": "Nigéria",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 531,
                "nome": "Niue, Ilha",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 535,
                "nome": "Norfolk, Ilha",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 538,
                "nome": "Noruega",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 542,
                "nome": "Nova Caledônia",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 545,
                "nome": "Papua Nova Guiné",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 548,
                "nome": "Nova Zelândia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 551,
                "nome": "Vanuatu",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 556,
                "nome": "Omã",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 563,
                "nome": "Pacífico, Ilhas do (Administração dos EUA)",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 566,
                "nome": "Pacífico, Ilhas do (Possessão dos EUA)",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 569,
                "nome": "Pacífico, Ilhas do (Território em Fideicomisso dos)",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 573,
                "nome": "Países Baixos (Holanda)",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 575,
                "nome": "Palau",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 576,
                "nome": "Paquistão",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 578,
                "nome": "Palestina",
                "creationDate": "2011-01-25",
                "extinctionDate": null
            },
            {
                "id": 580,
                "nome": "Panamá",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 583,
                "nome": "Papua Nova Guiné",
                "creationDate": "1991-12-01",
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 586,
                "nome": "Paraguai",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 589,
                "nome": "Peru",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 593,
                "nome": "Pitcairn, Ilha",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 599,
                "nome": "Polinésia Francesa",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 603,
                "nome": "Polônia, República da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 607,
                "nome": "Portugal",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 611,
                "nome": "Porto Rico",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 623,
                "nome": "Quênia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 625,
                "nome": "Quirguiz, República",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 628,
                "nome": "Reino Unido",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 640,
                "nome": "República Centro-Africana",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 647,
                "nome": "República Dominicana",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 660,
                "nome": "Reunião, Ilha",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 665,
                "nome": "Zimbábue",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 670,
                "nome": "Romênia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 675,
                "nome": "Ruanda",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 676,
                "nome": "Rússia, Federação da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 677,
                "nome": "Salomão, Ilhas",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 678,
                "nome": "Saint Kitts e Nevis",
                "creationDate": null,
                "extinctionDate": "2016-06-27"
            },
            {
                "id": 685,
                "nome": "Saara Ocidental",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 687,
                "nome": "El Salvador",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 690,
                "nome": "Samoa",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 691,
                "nome": "Samoa Americana",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 693,
                "nome": "São Bartolomeu",
                "creationDate": "2015-12-07",
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 695,
                "nome": "São Cristóvão e Neves, Ilhas",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 697,
                "nome": "San Marino",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 698,
                "nome": "São Martinho, Ilha de (Parte Francesa)",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 699,
                "nome": "São Martinho, Ilha de (Parte Holandesa)",
                "creationDate": "2015-12-07",
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 700,
                "nome": "São Pedro e Miquelon",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 705,
                "nome": "São Vicente e Granadinas",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 710,
                "nome": "Santa Helena",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 715,
                "nome": "Santa Lúcia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 720,
                "nome": "São Tomé e Príncipe, Ilhas",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 728,
                "nome": "Senegal",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 731,
                "nome": "Seychelles",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 735,
                "nome": "Serra Leoa",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 737,
                "nome": "Sérvia",
                "creationDate": "2006-06-03",
                "extinctionDate": null
            },
            {
                "id": 738,
                "nome": "Sikkim",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 741,
                "nome": "Singapura",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 744,
                "nome": "Síria, República Árabe da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 748,
                "nome": "Somália",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 750,
                "nome": "Sri Lanka",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 754,
                "nome": "eSwatini (Essuatíni, Suazilândia)",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 755,
                "nome": "Svalbard e Jan Mayen",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 756,
                "nome": "África do Sul",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 759,
                "nome": "Sudão",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 760,
                "nome": "Sudão do Sul",
                "creationDate": "2013-05-27",
                "extinctionDate": null
            },
            {
                "id": 764,
                "nome": "Suécia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 767,
                "nome": "Suíça",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 770,
                "nome": "Suriname",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 772,
                "nome": "Tadjiquistão, República do",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 776,
                "nome": "Tailândia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 780,
                "nome": "Tanzânia, República Unida da",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 781,
                "nome": "Terras Austrais Francesas",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 782,
                "nome": "Território Brit. Oc. Índico",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 783,
                "nome": "Djibuti",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 785,
                "nome": "Território da Alta Comissão do Pacífico Ocidental",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 788,
                "nome": "Chade",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 790,
                "nome": "Tchecoslováquia",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 791,
                "nome": "Tcheca, República",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 795,
                "nome": "Timor Leste",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 800,
                "nome": "Togo",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 805,
                "nome": "Toquelau, Ilhas",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 810,
                "nome": "Tonga",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 815,
                "nome": "Trinidad e Tobago",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 820,
                "nome": "Tunísia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 823,
                "nome": "Turcas e Caicos, Ilhas",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 824,
                "nome": "Turcomenistão, República do",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 827,
                "nome": "Turquia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 828,
                "nome": "Tuvalu",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 831,
                "nome": "Ucrânia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 833,
                "nome": "Uganda",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 840,
                "nome": "Uniao das Repúblicas Socialistas Soviéticas",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 845,
                "nome": "Uruguai",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 847,
                "nome": "Uzbequistão, República do",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 848,
                "nome": "Vaticano, Estado da Cidade do",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 850,
                "nome": "Venezuela",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 855,
                "nome": "Vietname Norte",
                "creationDate": null,
                "extinctionDate": "1996-12-13"
            },
            {
                "id": 858,
                "nome": "Vietnã",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 863,
                "nome": "Virgens, Ilhas (Britânicas)",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 866,
                "nome": "Virgens, Ilhas (EUA)",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 870,
                "nome": "Fiji",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 873,
                "nome": "Wake, Ilha",
                "creationDate": null,
                "extinctionDate": "2018-04-30"
            },
            {
                "id": 875,
                "nome": "Wallis e Futuna, Ilhas",
                "creationDate": null,
                "extinctionDate": "2022-11-20"
            },
            {
                "id": 888,
                "nome": "Congo, República Democrática do",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 890,
                "nome": "Zâmbia",
                "creationDate": null,
                "extinctionDate": null
            },
            {
                "id": 895,
                "nome": "Zona do Canal do Panamá",
                "creationDate": null,
                "extinctionDate": "2016-06-27"
            }
        ]

    };
}).service('StreetTypeService', function () {
    this.getStreetTypes = function () {
        return [
            {
                "id": "A",
                "nome": "Área"
            },
            {
                "id": "AC",
                "nome": "Acesso"
            },
            {
                "id": "ACA",
                "nome": "Acampamento"
            },
            {
                "id": "ACL",
                "nome": "Acesso Local"
            },
            {
                "id": "AD",
                "nome": "Adro"
            },
            {
                "id": "AE",
                "nome": "Área Especial"
            },
            {
                "id": "AER",
                "nome": "Aeroporto"
            },
            {
                "id": "AL",
                "nome": "Alameda"
            },
            {
                "id": "ALD",
                "nome": "Aldeia"
            },
            {
                "id": "AMD",
                "nome": "Avenida Marginal Direita"
            },
            {
                "id": "AME",
                "nome": "Avenida Marginal Esquerda"
            },
            {
                "id": "AN",
                "nome": "Anel Viário"
            },
            {
                "id": "ANT",
                "nome": "Antiga Estrada"
            },
            {
                "id": "ART",
                "nome": "Artéria"
            },
            {
                "id": "AT",
                "nome": "Alto"
            },
            {
                "id": "ATL",
                "nome": "Atalho"
            },
            {
                "id": "A V",
                "nome": "Área Verde"
            },
            {
                "id": "AV",
                "nome": "Avenida"
            },
            {
                "id": "AVC",
                "nome": "Avenida Contorno"
            },
            {
                "id": "AVM",
                "nome": "Avenida Marginal"
            },
            {
                "id": "AVV",
                "nome": "Avenida Velha"
            },
            {
                "id": "BAL",
                "nome": "Balneário"
            },
            {
                "id": "BC",
                "nome": "Beco"
            },
            {
                "id": "BCO",
                "nome": "Buraco"
            },
            {
                "id": "BEL",
                "nome": "Belvedere"
            },
            {
                "id": "BL",
                "nome": "Bloco"
            },
            {
                "id": "BLO",
                "nome": "Balão"
            },
            {
                "id": "BLS",
                "nome": "Blocos"
            },
            {
                "id": "BLV",
                "nome": "Bulevar"
            },
            {
                "id": "BSQ",
                "nome": "Bosque"
            },
            {
                "id": "BVD",
                "nome": "Boulevard"
            },
            {
                "id": "BX",
                "nome": "Baixa"
            },
            {
                "id": "C",
                "nome": "Cais"
            },
            {
                "id": "CAL",
                "nome": "Calçada"
            },
            {
                "id": "CAM",
                "nome": "Caminho"
            },
            {
                "id": "CAN",
                "nome": "Canal"
            },
            {
                "id": "CH",
                "nome": "Chácara"
            },
            {
                "id": "CHA",
                "nome": "Chapadão"
            },
            {
                "id": "CIC",
                "nome": "Ciclovia"
            },
            {
                "id": "CIR",
                "nome": "Circular"
            },
            {
                "id": "CJ",
                "nome": "Conjunto"
            },
            {
                "id": "CJM",
                "nome": "Conjunto Mutirão"
            },
            {
                "id": "CMP",
                "nome": "Complexo Viário"
            },
            {
                "id": "COL",
                "nome": "Colônia"
            },
            {
                "id": "COM",
                "nome": "Comunidade"
            },
            {
                "id": "CON",
                "nome": "Condomínio"
            },
            {
                "id": "COND",
                "nome": "Condomínio"
            },
            {
                "id": "COR",
                "nome": "Corredor"
            },
            {
                "id": "CPO",
                "nome": "Campo"
            },
            {
                "id": "CRG",
                "nome": "Córrego"
            },
            {
                "id": "CTN",
                "nome": "Contorno"
            },
            {
                "id": "DSC",
                "nome": "Descida"
            },
            {
                "id": "DSV",
                "nome": "Desvio"
            },
            {
                "id": "DT",
                "nome": "Distrito"
            },
            {
                "id": "EB",
                "nome": "Entre Bloco"
            },
            {
                "id": "EIM",
                "nome": "Estrada Intermunicipal"
            },
            {
                "id": "ENS",
                "nome": "Enseada"
            },
            {
                "id": "ENT",
                "nome": "Entrada Particular"
            },
            {
                "id": "EQ",
                "nome": "Entre Quadra"
            },
            {
                "id": "ESC",
                "nome": "Escada"
            },
            {
                "id": "ESD",
                "nome": "Escadaria"
            },
            {
                "id": "ESE",
                "nome": "Estrada Estadual"
            },
            {
                "id": "ESI",
                "nome": "Estrada Vicinal"
            },
            {
                "id": "ESL",
                "nome": "Estrada de Ligação"
            },
            {
                "id": "ESM",
                "nome": "Estrada Municipal"
            },
            {
                "id": "ESP",
                "nome": "Esplanada"
            },
            {
                "id": "ESS",
                "nome": "Estrada de Servidão"
            },
            {
                "id": "EST",
                "nome": "Estrada"
            },
            {
                "id": "ESV",
                "nome": "Estrada Velha"
            },
            {
                "id": "ETA",
                "nome": "Estrada Antiga"
            },
            {
                "id": "ETC",
                "nome": "Estação"
            },
            {
                "id": "ETD",
                "nome": "Estádio"
            },
            {
                "id": "ETN",
                "nome": "Estância"
            },
            {
                "id": "ETP",
                "nome": "Estrada Particular"
            },
            {
                "id": "ETT",
                "nome": "Estacionamento"
            },
            {
                "id": "EVA",
                "nome": "Evangélica"
            },
            {
                "id": "EVD",
                "nome": "Elevada"
            },
            {
                "id": "EX",
                "nome": "Eixo Industrial"
            },
            {
                "id": "FAV",
                "nome": "Favela"
            },
            {
                "id": "FAZ",
                "nome": "Fazenda"
            },
            {
                "id": "FER",
                "nome": "Ferrovia"
            },
            {
                "id": "FNT",
                "nome": "Fonte"
            },
            {
                "id": "FRA",
                "nome": "Feira"
            },
            {
                "id": "FTE",
                "nome": "Forte"
            },
            {
                "id": "GAL",
                "nome": "Galeria"
            },
            {
                "id": "GJA",
                "nome": "Granja"
            },
            {
                "id": "HAB",
                "nome": "Núcleo Habitacional"
            },
            {
                "id": "IA",
                "nome": "Ilha"
            },
            {
                "id": "IGP",
                "nome": "Igarapé"
            },
            {
                "id": "IND",
                "nome": "Indeterminado"
            },
            {
                "id": "IOA",
                "nome": "Ilhota"
            },
            {
                "id": "JD",
                "nome": "Jardim"
            },
            {
                "id": "JDE",
                "nome": "Jardinete"
            },
            {
                "id": "LD",
                "nome": "Ladeira"
            },
            {
                "id": "LGA",
                "nome": "Lagoa"
            },
            {
                "id": "LGO",
                "nome": "Lago"
            },
            {
                "id": "LOT",
                "nome": "Loteamento"
            },
            {
                "id": "LRG",
                "nome": "Largo"
            },
            {
                "id": "LT",
                "nome": "Lote"
            },
            {
                "id": "MER",
                "nome": "Mercado"
            },
            {
                "id": "MNA",
                "nome": "Marina"
            },
            {
                "id": "MOD",
                "nome": "Modulo"
            },
            {
                "id": "MRG",
                "nome": "Projeção"
            },
            {
                "id": "MRO",
                "nome": "Morro"
            },
            {
                "id": "MTE",
                "nome": "Monte"
            },
            {
                "id": "NUC",
                "nome": "Núcleo"
            },
            {
                "id": "NUR",
                "nome": "Núcleo Rural"
            },
            {
                "id": "O",
                "nome": "Outros"
            },
            {
                "id": "OUT",
                "nome": "Outeiro"
            },
            {
                "id": "PAR",
                "nome": "Paralela"
            },
            {
                "id": "PAS",
                "nome": "Passeio"
            },
            {
                "id": "PAT",
                "nome": "Pátio"
            },
            {
                "id": "PC",
                "nome": "Praça"
            },
            {
                "id": "PCE",
                "nome": "Praça de Esportes"
            },
            {
                "id": "PDA",
                "nome": "Parada"
            },
            {
                "id": "PDO",
                "nome": "Paradouro"
            },
            {
                "id": "PNT",
                "nome": "Ponta"
            },
            {
                "id": "PR",
                "nome": "Praia"
            },
            {
                "id": "PRL",
                "nome": "Prolongamento"
            },
            {
                "id": "PRM",
                "nome": "Parque Municipal"
            },
            {
                "id": "PRQ",
                "nome": "Parque"
            },
            {
                "id": "PRR",
                "nome": "Parque Residencial"
            },
            {
                "id": "PSA",
                "nome": "Passarela"
            },
            {
                "id": "PSG",
                "nome": "Passagem"
            },
            {
                "id": "PSP",
                "nome": "Passagem de Pedestre"
            },
            {
                "id": "PSS",
                "nome": "Passagem Subterrânea"
            },
            {
                "id": "PTE",
                "nome": "Ponte"
            },
            {
                "id": "PTO",
                "nome": "Porto"
            },
            {
                "id": "Q",
                "nome": "Quadra"
            },
            {
                "id": "QTA",
                "nome": "Quinta"
            },
            {
                "id": "QTS",
                "nome": "Quintas"
            },
            {
                "id": "R",
                "nome": "Rua"
            },
            {
                "id": "R I",
                "nome": "Rua Integração"
            },
            {
                "id": "R L",
                "nome": "Rua de Ligação"
            },
            {
                "id": "R P",
                "nome": "Rua Particular"
            },
            {
                "id": "R V",
                "nome": "Rua Velha"
            },
            {
                "id": "RAM",
                "nome": "Ramal"
            },
            {
                "id": "RCR",
                "nome": "Recreio"
            },
            {
                "id": "REC",
                "nome": "Recanto"
            },
            {
                "id": "RER",
                "nome": "Retiro"
            },
            {
                "id": "RES",
                "nome": "Residencial"
            },
            {
                "id": "RET",
                "nome": "Reta"
            },
            {
                "id": "RLA",
                "nome": "Ruela"
            },
            {
                "id": "RMP",
                "nome": "Rampa"
            },
            {
                "id": "ROA",
                "nome": "Rodo Anel"
            },
            {
                "id": "ROD",
                "nome": "Rodovia"
            },
            {
                "id": "ROT",
                "nome": "Rotula"
            },
            {
                "id": "RPE",
                "nome": "Rua de Pedestre"
            },
            {
                "id": "RPR",
                "nome": "Margem"
            },
            {
                "id": "RTN",
                "nome": "Retorno"
            },
            {
                "id": "RTT",
                "nome": "Rotatória"
            },
            {
                "id": "SEG",
                "nome": "Segunda Avenida"
            },
            {
                "id": "SIT",
                "nome": "Sitio"
            },
            {
                "id": "SRV",
                "nome": "Servidão"
            },
            {
                "id": "ST",
                "nome": "Setor"
            },
            {
                "id": "SUB",
                "nome": "Subida"
            },
            {
                "id": "TCH",
                "nome": "Trincheira"
            },
            {
                "id": "TER",
                "nome": "Terminal"
            },
            {
                "id": "TR",
                "nome": "Trecho"
            },
            {
                "id": "TRV",
                "nome": "Trevo"
            },
            {
                "id": "TUN",
                "nome": "Túnel"
            },
            {
                "id": "TV",
                "nome": "Travessa"
            },
            {
                "id": "TVP",
                "nome": "Travessa Particular"
            },
            {
                "id": "TVV",
                "nome": "Travessa Velha"
            },
            {
                "id": "UNI",
                "nome": "Unidade"
            },
            {
                "id": "V",
                "nome": "Via"
            },
            {
                "id": "V C",
                "nome": "Via Coletora"
            },
            {
                "id": "V L",
                "nome": "Via Local"
            },
            {
                "id": "VAC",
                "nome": "Via de Acesso"
            },
            {
                "id": "VAL",
                "nome": "Vala"
            },
            {
                "id": "VCO",
                "nome": "Via Costeira"
            },
            {
                "id": "VD",
                "nome": "Viaduto"
            },
            {
                "id": "V-E",
                "nome": "Via Expressa"
            },
            {
                "id": "VER",
                "nome": "Vereda"
            },
            {
                "id": "VEV",
                "nome": "Via Elevado"
            },
            {
                "id": "VL",
                "nome": "Vila"
            },
            {
                "id": "VLA",
                "nome": "Viela"
            },
            {
                "id": "VLE",
                "nome": "Vale"
            },
            {
                "id": "VLT",
                "nome": "Via Litorânea"
            },
            {
                "id": "VPE",
                "nome": "Via de Pedestre"
            },
            {
                "id": "VRT",
                "nome": "Variante"
            },
            {
                "id": "ZIG",
                "nome": "Zigue-Zague"
            }
        ]
    };
}).service('AlertService', function ($timeout, $q) {
    var modal = {
        visible: false,
        type: '',
        message: '',
        onClose: null,
        onConfirm: null,
        onCancel: null,
        isConfirm: false
    };

    return {
        getModal: function () {
            return modal;
        },
        showModal: function (type, message, duration, onCloseCallback) {
            modal.type = type;
            modal.message = message;
            modal.visible = true;
            modal.isConfirm = false;
            modal.onClose = function () {
                modal.visible = false;
                if (onCloseCallback) onCloseCallback();
            };

            if (duration) {
                $timeout(() => modal.onClose(), duration);
            }
        },
        success: function (message, duration, cb) {
            this.showModal('success', message, duration, cb);
        },
        error: function (message, duration, cb) {
            this.showModal('error', message, duration, cb);
        },
        info: function (message, duration, cb) {
            this.showModal('info', message, duration, cb);
        },
        warning: function (message, duration, cb) {
            this.showModal('warning', message, duration, cb);
        },
        confirm: function (message) {
            const deferred = $q.defer();

            modal.type = 'warning';
            modal.message = message;
            modal.visible = true;
            modal.isConfirm = true;

            modal.onConfirm = function () {
                modal.visible = false;
                deferred.resolve(true);
            };
            modal.onCancel = function () {
                modal.visible = false;
                deferred.resolve(false);
            };

            return deferred.promise;
        }
    };
}).directive('customModal', function (AlertService) {
    return {
        restrict: 'E',
        template: `
        <div ng-if="modal.visible"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
            
            <div class="bg-white rounded-2xl p-6 shadow-xl animate-fade-in-up w-[450px] h-[300px]">
                <div class="flex flex-col justify-between items-center text-center h-full w-full">

                    <div class="flex justify-center">
                        <svg ng-if="modal.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="60" height="60"
                            viewBox="0 0 60 60" fill="none">
                            <circle cx="30" cy="30" r="29" stroke="#28A745" stroke-width="2" />
                            <path d="M16.1665 30L25.7886 39.6221C25.9931 39.8266 26.328 39.8155 26.5184 39.5978L43.6665 20"
                                stroke="#28A745" stroke-width="2" stroke-linecap="round" />
                        </svg>
                        <svg ng-if="modal.type === 'warning'" width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="30" cy="30" r="29" stroke="#FF9700" stroke-width="2"/>
                            <path d="M30.3681 12.5C29.0347 12.5 27.8125 13.8812 27.8125 15.6768V34.3232C27.8125 35.9807 28.9236 37.5 30.3681 37.5C31.8125 37.5 32.8125 36.1188 32.8125 34.3232V15.5387C32.8125 13.8812 31.7014 12.5 30.3681 12.5Z" fill="#FF9700"/>
                            <path d="M30.3681 42.5C29.0347 42.5 27.8125 43.4804 27.8125 44.7549V45.2451C27.8125 46.4216 28.9236 47.5 30.3681 47.5C31.8125 47.5 32.8125 46.5196 32.8125 45.2451V44.7549C32.8125 43.4804 31.7014 42.5 30.3681 42.5Z" fill="#FF9700"/>
                        </svg>
                        <svg ng-if="modal.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="60" height="60"
                            viewBox="0 0 60 60" fill="none">
                            <circle cx="30" cy="30" r="29" stroke="#DC3545" stroke-width="2" />
                            <path d="M20 20L40 40M40 20L20 40" stroke="#DC3545" stroke-width="2" stroke-linecap="round" />
                        </svg>
                        <svg ng-if="modal.type === 'info'" xmlns="http://www.w3.org/2000/svg" width="60" height="60"
                            viewBox="0 0 60 60" fill="none">
                            <circle cx="30" cy="30" r="29" stroke="#17A2B8" stroke-width="2" />
                            <line x1="30" y1="20" x2="30" y2="22" stroke="#17A2B8" stroke-width="2" stroke-linecap="round" />
                            <line x1="30" y1="26" x2="30" y2="40" stroke="#17A2B8" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </div>

                    <div class="px-4">
                        <h1 class="text-lg font-semibold text-gray-800 break-words">{{ modal.message }}</h1>
                    </div>

                    <div class="self-stretch bg-[#D9D9D9] h-[1px] my-4"></div>

                    <div ng-if="!modal.isConfirm">
                        <button ng-click="modal.onClose()"
                            class="px-5 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 hover:cursor-pointer transition">
                            OK
                        </button>
                    </div>

                    <p ng-if="modal.isConfirm" class="text-gray-500 text-sm">Esta ação não poderá ser desfeita!</p>

                    <div ng-if="modal.isConfirm" class="flex gap-4">
                        <button type="button"
                            class="px-4 py-2 bg-white rounded shadow-[0px_0px_3px_1px_rgba(0,0,0,0.25)] font-semibold hover:cursor-pointer hover:bg-gray-100"
                            ng-click="modal.onCancel()">
                            Cancelar
                        </button>
                        <button type="button"
                            class="text-white px-4 py-2 bg-[#2563EB] rounded shadow-[0px_0px_2px_0px_rgba(0,0,0,0.25)] font-semibold hover:cursor-pointer hover:bg-blue-700"
                            ng-click="modal.onConfirm()">
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        </div>
      `,
        link: function (scope) {
            scope.modal = AlertService.getModal();
        }
    };
});
