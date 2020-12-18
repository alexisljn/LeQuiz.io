
class GameUtil {

    static ROOMS_ID = [];

    static generateQuizQuery = (gameConfiguration) => {
        let query = ''
        switch (gameConfiguration.gameMode.classname) {
            case 'Serie':
                query = GameUtil.generateSerieQuizQuery(gameConfiguration);
                console.log("lobjet query final", query)
                break;

            case 'Ascension':
                break;

            case 'Blitz':
                break;

            case 'Survivant':
                break;
        }

        return query;

    }

    static generateSerieQuizQuery = (gameConfiguration) => {

        const questionTypesLabel = gameConfiguration.questionTypes.map(questionType => questionType.type);
        const categoriesLabel = gameConfiguration.categories.map(category => category.id);
        const limit = Number(gameConfiguration.winCriterion);

        return {
            query:`SELECT  "question"."id", "question"."type", "question"."content", 
                "question"."answer", "question"."media", "category"."name" 
                FROM "question"
                INNER JOIN "category_question" ON "question"."id" = "category_question"."questionId"
                INNER JOIN "category" ON "category_question"."categoryId" = "category"."id"
                WHERE "question"."status" = 'approved' AND "question"."type" IN (:questionTypes)
                AND "category_question"."categoryId" IN (:categories) 
                ORDER BY random() LIMIT :limit;`
            ,
            options: {
                replacements: {
                    questionTypes: questionTypesLabel,
                    categories: categoriesLabel,
                    limit,

                },
                type: db.sequelize.QueryTypes.SELECT
            }
        };

        //TODO V2
        /*let categoriesAndItsQuestionsNb = [];
        const nbQuestionsPerCategory = Math.floor(
            Number(gameConfiguration.winCriterion / gameConfiguration.categories.length)
        );
        let categoryRemainder = gameConfiguration.winCriterion % gameConfiguration.categories.length;

        gameConfiguration.categories.forEach((category) => {
            let total = 0;
            for (const questionType in category.nbQuestions)  {
                total += Number(category['nbQuestions'][questionType]);
                category['nbQuestions'][questionType] = Number(category['nbQuestions'][questionType]);
            }
            category['nbQuestions']['total'] = total;
            // Determiner 1er reste si nécessaire
        });

        console.log('gameConfig avec les totaux', gameConfiguration.categories)
        if (categoryRemainder > 0) {
            while (categoryRemainder !== 0) {
                gameConfiguration.categories.forEach((category) => {

                })
            }
        }*/
    }

    static executeQuizQuery = async (queryObject) => {
        const records = await db.sequelize.query(queryObject.query, queryObject.options);

        console.log(records);
    }

}

module.exports = GameUtil;