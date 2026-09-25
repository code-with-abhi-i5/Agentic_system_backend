import { Annotation } from "@langchain/langgraph";

export const globalState = Annotation.Root({

    userQuery: Annotation({
        reducer: (_, value) => value,
        default: () => ""
    }),

    intent: Annotation({
        reducer: (_, value) => value,
        default: () => null
    }),

    constraints: Annotation({
        reducer: (_, value) => value,
        default: () => null
    }),

    clarification: Annotation({
        reducer: (_, value) => value,
        default: () => null
    }),

    blueprint: Annotation({
        reducer: (_, value) => value,
        default: () => null
    }),

    specifications: Annotation({
        reducer: (_, value) => value,
        default: () => []
    }),

    finalOutput: Annotation({
        reducer: (_, value) => value,
        default: () => []
    }),

    finalMarkdown: Annotation({
        reducer: (_, value) => value,
        default: () => null
    }),

    extractedRecords: Annotation({
        reducer: (_, value) => value,
        default: () => []
    }),

    cleanRecords: Annotation({
        reducer: (_, value) => value,
        default: () => []
    }),

    schemaDefinition: Annotation({
        reducer: (_, value) => value,
        default: () => []
    }),

    datasetTitle: Annotation({
        reducer: (_, value) => value,
        default: () => "Extracted Dataset"
    }),

    stats: Annotation({
        reducer: (_, value) => value,
        default: () => ({ totalRecords: 0, duplicatesRemoved: 0, sourcesCount: 0, accuracy: 100 })
    })

});