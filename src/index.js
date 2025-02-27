var app = angular.module("myApp", []);

app.controller("MyCtrl", function ($scope, $timeout, $document) {
    $scope.mode = "home";

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
    $scope.searchQuery = '';
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

    $scope.isAccordionOpen = false;

    $scope.toggleAccordion = function () {
        $scope.isAccordionOpen = !$scope.isAccordionOpen;
    };
});
