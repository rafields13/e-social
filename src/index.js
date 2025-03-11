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

    $scope.mandatory = true;

    $scope.submitForm = function (event) {
        event.preventDefault();
        console.log("Form submitted");
        console.log(event);
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
});
