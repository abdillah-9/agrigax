import { describe, test, expect } from "vitest";
import { createNewCategory, deleteCategoryById, selectAllCategories, selectCategoryById, selectCategoryByIdRange, updateCategoryById } from "./categories";

describe("categories tests...", ()=>{
    test("createCategory_test", async ()=>{

        const category_obj = {
            name:"test_name_"+Date.now(), 
            slug:"test_slug_"+Date.now(), 
            description: "test_description"
        }

        const result = await createNewCategory({category_obj});

        expect(result.category_id).toBeDefined();
    });

    test("updateCategoryById_test", async()=>{

        const category_obj = {
            id: 1,
            name:"test_update",
            slug:"test_update",
        }

        const result = await updateCategoryById({category_obj});

        expect(result.category_id).toBeDefined();
    })

    test("deleteCategoryById_test", async()=>{
        
        const category_id = 1;

        const result = await deleteCategoryById({category_id});

        expect(result.message).toBeDefined();
    });

    test("selectAllCategories_test", async()=>{

        const result = await selectAllCategories();

        expect(result.categories).toBeDefined();
    });

    test("selectCategoryByIdRange", async()=>{

        const start_id = 1;
        const end_id = 3;

        const result = await selectCategoryByIdRange({start_id, end_id});

        expect(result.categories).toBeDefined();
    });

    test("selectCategoryById", async()=>{

        const category_id = 100;
        const result = await selectCategoryById({category_id});

        expect(result.categories.length).toBe(1);
    });

});