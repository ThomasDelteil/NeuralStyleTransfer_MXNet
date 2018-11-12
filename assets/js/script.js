var app = angular.module('fileUpload', ['ngMaterial', 'ngMessages', 'material.svgAssetsCache',
    'ngFileUpload', 'uiCropper']);
app.controller('fileController', ['$scope', '$http', '$timeout', '$httpParamSerializerJQLike', 'ngfDataUrlFilter',
    function ($scope, $http, $timeout, $httpParamSerializerJQLike, ngfDataUrlFilter) {

    var getFileBlob = function (url, cb) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.responseType = "blob";
                xhr.addEventListener('load', function() {
                    cb(xhr.response);
                });
                xhr.send();
        };

        var blobToFile = function (blob, name) {
                blob.lastModifiedDate = new Date();
                blob.name = name;
                return blob;
        };

        var getFileObject = function(filePathOrUrl, cb) {
               getFileBlob(filePathOrUrl, function (blob) {
                  cb(blobToFile(blob, 'test.jpg'));
               });
        };


        $scope.updateImage = function (filename) {
            $scope.picFileUpdated = window.location.href + filename;
            getFileObject($scope.picFileUpdated, function (fileObject) {
                 $scope.currentFile = fileObject;
            });
            $scope.onImageUpdated();
        };

        $scope.content_images = [
            { 'url': 'assets/images/content1.jpg' },
            { 'url': 'assets/images/content2.jpg' },
            { 'url': 'assets/images/content3.jpg' },
            { 'url': 'assets/images/content4.jpg' },
            { 'url': 'assets/images/content5.jpg' },
            { 'url': 'assets/images/content6.jpg' }
        ];

        $scope.style_images = [
            { 'url': 'assets/images/wave.jpg', 'name':'wave' },
            { 'url': 'assets/images/sunrise.jpg', 'name':'sunrise' },
            { 'url': 'assets/images/starry_night.jpg', 'name':'star' },
        ];

        $scope.current_style = $scope.style_images[0].name;

        $scope.selectStyle = function(name) {
            $scope.current_style = name;
            $scope.onImageUpdated();
        }

        $scope.p = {"prediction":[]};
        $scope.upload = function () {
            if ($scope.currentFile) {

                var form = new FormData();
                form.append('data', $scope.currentFile);
                $scope.showSpinner = true;
                $http({
                    method: 'POST',
                    url: 'https://nst.saravanakumar.me/'+$scope.current_style+'/predict',
                    data: form,
                    headers: { 'Content-Type': undefined },
                }).then(function (response) {
                    $timeout(function() {
                        $scope.showSpinner = false;
                        $scope.result = response.data.prediction;
                    })
                }, function (response) {
                    $scope.showSpinner = false;
                    $scope.errorMessage = "There was an error with your request";
                    console.log(response);
                }, function (evt) {
                    $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                });
            }
        }

        $scope.$watchCollection('picFile', function () {
            if ($scope.picFile) {
                $scope.picFileUpdated = ngfDataUrlFilter($scope.picFile);

                if (!$scope.currentFile ||
                    (($scope.currentFile.name != $scope.picFile.name) &&
                        ($scope.currentFile.size != $scope.picFile.size))) {
                    $scope.currentFile = $scope.picFile;
                    $scope.onImageUpdated();
                }
            }
        }, true);

        $scope.drag = function ($isDragging, $class, $event) {

            if ($isDragging) {
                $('#dropArea').addClass('draggedOver');
                $('#textInfo').addClass('draggedOver');
                $('#uploadIcon').addClass('draggedOver');
            } else {
                $scope.removeClasses();
            }
        }

        $scope.removeClasses = function () {
            $('#dropArea').removeClass('draggedOver');
            $('#textInfo').removeClass('draggedOver');
            $('#uploadIcon').removeClass('draggedOver');
        }

        $scope.onImageUpdated = function () {
            if ($scope.picFileUpdated != undefined) {
                $scope.result = $scope.picFileUpdated;
                $('#dropArea').height(60);
                $scope.removeClasses();
                $timeout(function () {
                    $scope.upload()
                }, 200);
            }
        }


    }])
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
        $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
        $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
        $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
    });