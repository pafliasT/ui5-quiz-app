sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,MessageToast) {
        "use strict";

        return Controller.extend("project1.controller.View1", {
            onInit: function () {

            },

            onOptionSelect: function (oEvent) {
                let oList = oEvent.getSource();
                let oBindingContext = oList.getBindingContext("quizModel");
                let oCurrentQuestion = oBindingContext.getObject();

                let aSelectedItems = oList.getSelectedItems();
                let aSelectedTexts = aSelectedItems.map(item => item.getTitle().trim()); // Trimming to avoid whitespace issues
                let aCorrectAnswers = oCurrentQuestion.correctAnswer; // Dynamically get correct answers from the current question context

                // Check if all selected items are found in the correct answers
                let allSelectedAreCorrect = aSelectedTexts.every(text => aCorrectAnswers.includes(text));

                // Check if the number of selected items equals the number of correct answers
                let allCorrectAnswersSelected = aCorrectAnswers.every(ans => aSelectedTexts.includes(ans));

                if (allSelectedAreCorrect && allCorrectAnswersSelected) {
                   MessageToast.show("Perfect! All correct answers selected.");
                } else if (allSelectedAreCorrect) {
                   MessageToast.show("Correct answer! Select more if necessary.");
                } else {
                   MessageToast.show("Incorrect answer, try again!");
                }
            },
            // onSubmitQuiz: function () {
            //     let quizModel = this.getView().getModel("quizModel");
            //     let questions = quizModel.getProperty("/Questions");
            //     let totalQuestions = questions.length;
            //     let currentScore = 0;

            //     questions.forEach(question => {
            //         if (question.answeredCorrectly) {
            //             currentScore += 1; // Increment score for each correctly answered question
            //         }
            //     });

            //     let percentageScore = (currentScore / totalQuestions) * 100;
            //     quizModel.setProperty("/currentScore", currentScore);
            //     quizModel.setProperty("/percentageScore", percentageScore);

            //     // Display final result
            //     if (percentageScore >= 66) {
            //         MessageToast.show("Congratulations! You've passed the quiz with " + percentageScore.toFixed(2) + "%.");
            //     } else {
            //         MessageToast.show("Unfortunately, you did not pass. You scored " + percentageScore.toFixed(2) + "%.");
            //     }
            // }
        });
    });
