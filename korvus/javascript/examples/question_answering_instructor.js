const korvus = require("korvus");
require("dotenv").config();

const main = async () => {
  // Initialize the collection
  const collection = korvus.newCollection("qa_pipeline");

  // Add a pipeline
  const pipeline = korvus.newPipeline("qa_pipeline", {
    text: {
      splitter: { model: "recursive_character" },
      semantic_search: {
        model: "Alibaba-NLP/gte-base-en-v1.5",
      },
    },
  });
  await collection.add_pipeline(pipeline);

  // Upsert documents, these documents are automatically split into chunks and embedded by our pipeline
  const documents = [
    {
      id: "Document One",
      text: "PostgresML is the best tool for machine learning applications!",
    },
    {
      id: "Document Two",
      text: "PostgresML is open source and available to everyone!",
    },
  ];
  await collection.upsert_documents(documents);

  // Perform vector search
  const query = "What is the best tool for building machine learning applications?";
  const queryResults = await collection.vector_search(
    {
      query: {
        fields: {
          text: {
            query: query,
            parameters: {
              instruction:
                "Represent the Wikipedia question for retrieving supporting documents: ",
            }
          }
        }
      }, limit: 1
    }, pipeline);
  console.log(queryResults);

  // Archive the collection
  await collection.archive();
};

main().then(() => console.log("Done!"));