export default function CategoriesTree({ categories, selectedCategories, handleSelectCategory, depth = 0 }) {
    return (
        <ul className="categories-list">
            {categories.map((category) => (
                <li
                    className="category-item border border-2 border-dark"
                    style={{
                        "marginLeft": depth * 20 + "px",
                        "marginRight": depth * 20 + "px",
                        "marginBottom": "20px"
                    }}
                    key={category._id}
                >
                    <div className="form-check p-3 d-flex align-items-center">
                        <input
                            className="form-check-input m-0 me-2"
                            type="checkbox"
                            checked={selectedCategories?.includes(category._id)}
                            id={category._id}
                            onChange={(e) => handleSelectCategory(category, e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={category._id}>
                            {category.name}
                        </label>
                    </div>
                    {category?.subcategories.length > 0 && <CategoriesTree
                        categories={category.subcategories}
                        selectedCategories={selectedCategories}
                        handleSelectCategory={handleSelectCategory}
                        depth={depth + 1}
                    />}
                </li>
            ))}
        </ul>
    )
}