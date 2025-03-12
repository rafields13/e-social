var app = angular.module("myApp", ['ui.utils.masks']);

app.controller("MyCtrl", function ($scope, $timeout, $document) {
    $scope.mode = "initial";

    $scope.switchMode = function (mode) {
        $scope.mode = mode;
    };

    $scope.showUpdateMenu = false;

    $scope.checkCloseUpdateDropdown = function () {
        $timeout(function () {
            var isMouseOverButton = document.querySelector('.update-button:hover');
            var isMouseOverMenu = document.querySelector('.update-dropdown:hover');

            if (!isMouseOverButton && !isMouseOverMenu) {
                $scope.showUpdateMenu = false;
            }
        }, 100);
    };

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

    $scope.closeModal = function (id) {
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
    };

    $scope.mandatory = false;

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
                // console.log(data);
                // data = {
                //     "cep": "70744-070",
                //     "logradouro": "Quadra SQN 108 Bloco G",
                //     "complemento": "",
                //     "unidade": "",
                //     "bairro": "Asa Norte",
                //     "localidade": "Brasília",
                //     "uf": "DF",
                //     "estado": "Distrito Federal",
                //     "regiao": "Centro-Oeste",
                //     "ibge": "5300108",
                //     "gia": "",
                //     "ddd": "61",
                //     "siafi": "9701"
                // }

                // $scope.user.streetDescription = data.logradouro;
                // $scope.user.neighborhood = data.bairro;
                // $scope.user.city = data.localidade;
                // $scope.user.state = data.uf;

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

    $scope.user = {
        birthState: {},
        birthCity: {},
    };

    $scope.states = [];
    $scope.cities = [];

    $timeout(async function () {
        $scope.states = await getStates();
        $scope.states.push({ id: -1, nome: "Estrangeiro" });
    });

    $scope.$watch("user.birthState", async function (newState) {
        if (newState) {
            $scope.cities = await getCities(newState.id);
            $scope.cities.push({ id: -1, nome: "Estrangeiro" });
            $scope.user.birthCity = {};
        }
    });
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

                let sum = 0, remainder;
                let weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
                for (let i = 0; i < 12; i++) sum += parseInt(cnpj[i]) * weights[i];
                remainder = sum % 11;
                if (remainder < 2) {
                    if (parseInt(cnpj[12]) !== 0) {
                        ctrl.$setValidity('cnpj', false);
                        element[0].setCustomValidity("CNPJ inválido! Verifique o número digitado.");
                        return value;
                    }
                } else {
                    if (parseInt(cnpj[12]) !== 11 - remainder) {
                        ctrl.$setValidity('cnpj', false);
                        element[0].setCustomValidity("CNPJ inválido! Verifique o número digitado.");
                        return value;
                    }
                }
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
            required: '@',
            formId: '@',
            formName: '@'
        },
        template: `
            <div class="relative w-full">
                <input type="text" ng-model="searchText"
                    id="{{ formId }}"
                    name="{{ formName }}"
                    class="p-2 border border-[#C9C9C9] rounded-sm focus:outline-none h-10 w-full pr-8"
                    placeholder="{{ placeholder }}"
                    ng-required="required"
                    ng-focus="showDropdown = true"
                    ng-blur="hideDropdown()"
                    ng-keydown="onKeydown($event)" />
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" 
                    class="absolute right-2 top-1/2 transform -translate-y-1/2 transition duration-200">
                    <path d="M5.83331 8.33333L9.99998 12.5L14.1666 8.33333" 
                        stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
                <div class="absolute z-10 bg-white border border-gray-300 w-full mt-1 max-h-40 overflow-y-auto rounded-sm"
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
        }
    };
});
