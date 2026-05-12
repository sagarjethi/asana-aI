import RecipeExternalWebsite from './RecipeExternalWebsite'

import RecipeSuggestion from './RecipeSuggestion'
import RecipePageSocials from './RecipePageSocials'
import Image from 'next/image'
import { MealData } from '@/app/api/diet/mealData'

export default function RecipePage(props: { recipe: MealData }) {
    const recipe = props.recipe

    return (
        <div className="flex bg-cream-fade min-h-screen">
            <div className="w-full lg:w-2/3 p-6 lg:p-12 flex flex-col gap-6">
                <div>
                    <span className="text-xs uppercase tracking-[0.18em] text-sun-700 font-semibold">
                        Recipe
                    </span>
                    <h1 className="font-display text-4xl text-ink-900 mt-1">
                        {recipe.name}
                    </h1>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <span
                        className={`text-xs px-3 py-1 rounded-full capitalize font-medium ${
                            recipe.vegetarian
                                ? 'bg-sage-300/40 text-sage-700'
                                : 'bg-ember-500/10 text-ember-600'
                        }`}
                    >
                        {recipe.meal_type}
                    </span>

                    {recipe.tags.map((tag, idx) => (
                        <span
                            key={idx}
                            className="capitalize text-xs bg-cream-100 border border-ink-900/8 text-ink-700 px-3 py-1 rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                    <div className="sun-card p-5">
                        <h3 className="font-display text-2xl text-ink-900 mb-3">
                            Ingredients
                        </h3>
                        <ul className="text-ink-800 space-y-2 text-sm">
                            {recipe.ingredients.map((ig, idx) => (
                                <li
                                    key={idx}
                                    className="flex justify-between gap-3 border-b border-ink-900/6 pb-1.5"
                                >
                                    <span>{ig.item}</span>
                                    <span className="text-ink-700/70 shrink-0">
                                        {ig.quantity}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="sun-card p-5">
                        <h3 className="font-display text-2xl text-ink-900 mb-3">
                            Preparation
                        </h3>
                        <ol className="space-y-2 text-sm text-ink-800">
                            {recipe.preparation_steps.map((step, index) => (
                                <li key={index} className="flex gap-3">
                                    <span className="font-display text-sun-700 shrink-0">
                                        {index + 1}.
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                <div className="sun-card p-5">
                    <h2 className="font-display text-xl text-ink-900 mb-3">
                        Nutritional information
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            [
                                'Calories',
                                recipe.nutritional_information.calories,
                            ],
                            ['Protein', recipe.nutritional_information.protein],
                            [
                                'Carbs',
                                recipe.nutritional_information.carbohydrates,
                            ],
                            ['Fats', recipe.nutritional_information.fats],
                        ].map(([label, value]) => (
                            <div
                                key={label as string}
                                className="bg-cream-100 border border-ink-900/8 rounded-2xl p-3 text-center"
                            >
                                <div className="text-[10px] uppercase tracking-wider text-ink-700/70">
                                    {label}
                                </div>
                                <div className="font-display text-xl text-ink-900 mt-1">
                                    {value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full h-[50vh] rounded-3xl overflow-hidden bg-cream-200 shadow-soft">
                    <iframe
                        className="h-full w-full"
                        src={`https://www.youtube.com/embed/${recipe.video.split('=')[1]}`}
                        title={recipe.name}
                        frameBorder="0"
                        allow="accelerometer; encrypted-media; picture-in-picture"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    ></iframe>
                </div>

                <div className="flex flex-col mt-6 gap-4">
                    <h2 className="font-display text-2xl text-ink-900">
                        Browse other dishes
                    </h2>
                    <RecipeSuggestion />
                </div>
            </div>

            <div className="relative hidden lg:block lg:w-1/3">
                <Image
                    height={0}
                    width={0}
                    sizes="100vw"
                    loading="eager"
                    src={`/meals/${recipe.image}`}
                    alt={recipe.name}
                    className="w-full h-screen object-cover sticky top-0"
                />

                <div className="fixed mt-32 top-5 right-5 flex flex-col gap-3 text-2xl bg-cream-50/95 backdrop-blur border border-ink-900/8 rounded-2xl p-2 shadow-soft">
                    <RecipePageSocials mealID={recipe.id} />
                </div>

                <div className="fixed bottom-5 right-0 xl:px-2">
                    <RecipeExternalWebsite website={recipe.website} />
                </div>
            </div>

            <div className="sm:hidden relative">
                <div className="absolute top-10 right-2 flex flex-col gap-3 text-2xl bg-cream-50/95 backdrop-blur border border-ink-900/8 rounded-2xl p-2 shadow-soft">
                    <RecipePageSocials mealID={recipe.id} />
                </div>
            </div>
        </div>
    )
}
