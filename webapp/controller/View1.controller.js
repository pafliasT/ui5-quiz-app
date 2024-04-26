sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit: function () {
            this.oComponent = this.getOwnerComponent();
            this.oQuizModel = this.oComponent.getModel("quizModel");
            this.oRouter = UIComponent.getRouterFor(this);
            this.oRouter.getRoute("RouteView1").attachPatternMatched(this.onRouteMatched, this);
        },

        onRouteMatched: function () {
            this.setupView();
            this.updateProgress();
        },

        setupView: function () {
            this.toggleSubmitButtonVisibility();
            this.updateProgress();
        },

        updateProgress: function () {
            const oCarousel = this.byId("questionCarousel");
            const aPages = oCarousel.getPages();
            const iCurrentPage = aPages.findIndex(page => page.getId() === oCarousel.getActivePage()) + 1;
            const totalQuestions = aPages.length;
            const progress = (iCurrentPage / totalQuestions) * 100;

            this.oQuizModel.setProperty("/progress", progress);
            this.oQuizModel.setProperty("/progressText", `${Math.round(progress)}%`);
        },

        toggleSubmitButtonVisibility: function () {
            const oCarousel = this.byId("questionCarousel");
            const aPages = oCarousel.getPages();
            const iCurrentPage = aPages.findIndex(page => page.getId() === oCarousel.getActivePage());
            const bIsLastQuestion = iCurrentPage === this.oQuizModel.getData().Questions.length - 1;

            this.byId("submitQuizButton").setVisible(bIsLastQuestion);
        },

        onPageChanged: function (oEvent) {
            this.toggleSubmitButtonVisibility();
            this.updateProgress();
        },

        onOptionSelect: function (oEvent) {
            const oList = oEvent.getSource();
            const oBindingContext = oList.getBindingContext("quizModel");
            const oQuestion = oBindingContext.getObject();
            const aSelectedItems = oList.getSelectedItems();
            const aSelectedTexts = aSelectedItems.map(item => item.getTitle().trim());

            oQuestion.userAnswers = aSelectedTexts;
            this.oQuizModel.refresh();
        },

        calculateScore: function () {
            const oData = this.oQuizModel.getData();
            const totalQuestions = oData.Questions.length;
            let correctAnswers = oData.Questions.reduce((acc, question) => {
                const { userAnswers = [], correctAnswer, multiple } = question;
                const isCorrect = multiple ?
                    (userAnswers.length === correctAnswer.length && userAnswers.every(answer => correctAnswer.includes(answer))) :
                    (userAnswers.length === 1 && correctAnswer.includes(userAnswers[0]));
                return acc + (isCorrect ? 1 : 0);
            }, 0);

            return (correctAnswers / totalQuestions) * 100;
        },

        onSubmitQuiz: function () {
            const score = this.calculateScore();
            const scoreFormatted = score.toFixed(2);
            let resultsText = `You scored ${scoreFormatted}%.`;

            if (score >= 66) {
                resultsText += " Congratulations! You passed the quiz.";
                this.getView().getModel("quizModel").setProperty("/dialogState", "Success");
            } else {
                resultsText += " Unfortunately, you scored below the passing threshold. Please try again.";
                this.getView().getModel("quizModel").setProperty("/dialogState", "Error");
            }

            this.byId("resultsText").setText(resultsText);
            this.byId("resultsDialog").open();
        },

        onRestartQuiz: function () {
            const oQuizModel = this.getView().getModel("quizModel");
            oQuizModel.getData().Questions.forEach(question => {
                question.userAnswers = [];
            });
            oQuizModel.refresh();
            this.resetQuiz();
        },

        resetQuiz: function () {
            const oCarousel = this.byId("questionCarousel");
            const pages = oCarousel.getPages();

            // Recursive function to clear selections in nested Lists
            const clearListSelections = (control) => {
                if (control instanceof sap.m.List) {
                    control.removeSelections(true);
                }
                if (control.getContent) {
                    const contentItems = control.getContent();
                    contentItems.forEach(clearListSelections);
                } else if (control.getItems) {
                    const itemControls = control.getItems();
                    itemControls.forEach(clearListSelections);
                }
            };

            // Apply the recursive function to each page of the Carousel
            pages.forEach(page => {
                const content = page.getContent();
                content.forEach(clearListSelections);
            });

            // Reset the model data for user answers and progress indicators
            const oQuizModel = this.getView().getModel("quizModel");
            oQuizModel.getData().Questions.forEach(question => question.userAnswers = []);
            oQuizModel.refresh();
            oQuizModel.setProperty("/progress", 0);
            oQuizModel.setProperty("/progressText", "0%");
            this.byId("resultsDialog").close();
            oCarousel.setActivePage(pages[0]);
            this.toggleSubmitButtonVisibility();
        }




    });
});
