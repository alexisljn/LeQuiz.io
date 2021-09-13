import React from "react";
import LobbyEditSettingsButton from "./LobbyEditSettingsButton";

const CategoriesBox = ({categories, changeOptions, userCanEdit}) => {
    return (
        <div className="lobby-box lobby-box-categories">
            <div className="lobby-box-header">
                {userCanEdit &&
                    <LobbyEditSettingsButton onClick={() => changeOptions('categories')}/>
                }
                <span className="lobby-box-header-label">Catégories</span>
            </div>
            <div className="lobby-box-content">
                {categories.map((category, index) =>  (
                    <div className="lobby-categories-category" key={index}>
                        {category.label}
                    </div>
                ))}
            </div>
        </div>
    )
};

export default CategoriesBox;
