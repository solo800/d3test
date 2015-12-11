// Install the angularjs.TypeScript.DefinitelyTyped NuGet package
var App;
(function (App) {
    "use strict";
    var SmgStack = (function () {
        function SmgStack($scope) {
            this.$scope = $scope;
            $scope.title = "SmgStack";
            this.activate();
        }
        SmgStack.prototype.activate = function () {
        };
        SmgStack.$inject = ["$scope"];
        return SmgStack;
    })();
    angular.module("app").controller("SmgStack", SmgStack);
})(App || (App = {}));
