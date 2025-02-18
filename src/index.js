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
    $scope.selectedDepartment = null;
    $scope.searchQuery = '';
    $scope.departments = ["Órgão 1", "Órgão 2", "Órgão 3", "Órgão 4"];

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
});
