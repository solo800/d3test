// Install the angularjs.TypeScript.DefinitelyTyped NuGet package
module App {
    "use strict";

    interface ISmgStackScope extends ng.IScope {
        title: string;
    }

    interface ISmgStack {
        activate: () => void;
    }

    class SmgStack implements ISmgStack {
        static $inject: string[] = ["$scope"];

        constructor(private $scope: ISmgStackScope) {
            $scope.title = "SmgStack";

            this.activate();
        }

        activate() {

        }
    }

    angular.module("app").controller("SmgStack", SmgStack);
}