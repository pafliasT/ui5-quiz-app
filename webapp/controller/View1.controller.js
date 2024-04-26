sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
],
    function (Controller, MessageToast) {
        "use strict";

        return Controller.extend("project1.controller.View1", {
            onInit: function () {
                const oComponent = this.getOwnerComponent();
                this.oQuizModel = oComponent.getModel("quizModel");
                if (this.oQuizModel.getData() && Object.keys(this.oQuizModel.getData()).length !== 0) {
                    this.setupView();
                } else {
                    this.oQuizModel.attachRequestCompleted(this.onModelLoaded, this);
                }
            },


            onModelLoaded: function () {
                this.setupView();
            },

            setupView: function () {
                this.updateSubmitButtonVisibility()
            },


            updateSubmitButtonVisibility: function () {
                let oCarousel = this.byId("questionCarousel");
                let aPages = oCarousel.getPages();
                let sActivePageId = oCarousel.getActivePage();
                let iCurrentPage = aPages.findIndex(page => page.getId() === sActivePageId);
                let oData = this.oQuizModel.getData();
                let bIsLastQuestion = iCurrentPage === oData.Questions.length - 1;
                this.byId("submitQuizButton").setVisible(bIsLastQuestion);
            },


            onPageChanged: function (oEvent) {
                this.updateSubmitButtonVisibility();
            },


            onOptionSelect: function (oEvent) {
                let oList = oEvent.getSource();
                let oBindingContext = oList.getBindingContext("quizModel");
                let oQuestion = oBindingContext.getObject();

                let aSelectedItems = oList.getSelectedItems();
                let aSelectedTexts = aSelectedItems.map(item => item.getTitle().trim());
                oQuestion.userAnswers = aSelectedTexts;
                this.oQuizModel.refresh();
            },


            onSubmitQuiz: function () {
                let score = this.calculateScore();
                let scoreFormatted = score.toFixed(2);
                let resultMessage = `You scored ${scoreFormatted}%.`;
                if (score >= 66) {
                    resultMessage += " Congratulations! You passed the quiz.";
                } else {
                    resultMessage += " Unfortunately, you scored below the passing threshold. Please try again.";
                }
                MessageToast.show(resultMessage, {
                    duration: 6000
                });

                this.restartQuiz();
            },


            calculateScore: function () {
                let oData = this.oQuizModel.getData();
                let totalQuestions = oData.Questions.length;
                let correctAnswers = 0;

                oData.Questions.forEach(question => {
                    let userAnswers = question.userAnswers || [];
                    let correct = question.correctAnswer;
                    let isCorrect = false;

                    if (question.multiple) {
                        isCorrect = (userAnswers.length === correct.length) && userAnswers.every(answer => correct.includes(answer));
                    } else {
                        isCorrect = (userAnswers.length === 1) && correct.includes(userAnswers[0]);
                    }

                    if (isCorrect) correctAnswers++;
                });

                let scorePercentage = (correctAnswers / totalQuestions) * 100;
                return scorePercentage;
            },


                restartQuiz: function () {
                   
                    let oData = this.oQuizModel.getData();
                    let oCarousel = this.byId("questionCarousel");
                
                   
                    oData.Questions.forEach(question => {
                        question.userAnswers = []; // Clear user answers
                    });
                
                   
                    let aPages = oCarousel.getPages();

                    aPages.forEach((page) => {
                        if( page.getContent().length  > 0 ){

                            let oList = page.getContent().find((item) => item instanceof sap.m.List )

                            if(oList){
                                oList.removeSelections();
                            }
                        }
                        
                    });
                
                    // Refresh the quiz model to apply changes
                    this.oQuizModel.refresh();
                
                    // Set the active page to the first page in the carousel
                    oCarousel.setActivePage(aPages[0]);
                    console.log("spiros");
                }
                

            







        });
    });
