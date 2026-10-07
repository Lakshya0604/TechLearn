import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@radix-ui/react-separator'
import React, { useState } from 'react'


const categories = [
    { id: "nextjs", label: "Next.js" },
    { id: "react", label: "React" },
    { id: "nodejs", label: "Node.js" },
    { id: "mongodb", label: "MongoDB" },
    { id: "express", label: "Express.js" },
    { id: "javascript", label: "JavaScript" },
    { id: "typescript", label: "TypeScript" },
    { id: "python", label: "Python" },
    { id: "java", label: "Java" },
    { id: "csharp", label: "C#" },
    { id: "html", label: "HTML" },
    { id: "css", label: "CSS" },
    { id: "tailwind", label: "Tailwind CSS" },
    { id: "bootstrap", label: "Bootstrap" },
    { id: "redux", label: "Redux" },
    { id: "graphql", label: "GraphQL" },
    { id: "docker", label: "Docker" },
    { id: "kubernetes", label: "Kubernetes" },
    { id: "aws", label: "AWS" },
    { id: "git", label: "Git & GitHub" }
];

const Filter = ({ handleFilterChange }) => {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [shortByPrice, setShortByPrice] = useState("");

    const handleCategoryChange = (categoryId) => {
        setSelectedCategories((prevCategories) => {
            const newCategories = prevCategories.includes(categoryId) ? prevCategories.filter((id) => id !== categoryId) : [...prevCategories, categoryId];

            handleFilterChange(newCategories, shortByPrice);
            return newCategories;
        });

    };
    const selectByPriceHandler = (selectedValue) => {
        setShortByPrice(selectedValue);
        handleFilterChange(selectedCategories, selectedValue);
    }

    return (
        <div className='w-full md:w-56 md:shrink-0 rounded-xl border bg-card p-4'>
            <div className='flex flex-col gap-3'>
                <h1 className='font-semibold text-lg md:text-xl'>Filter options </h1>
                <Select onValueChange={selectByPriceHandler}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Sort by Price</SelectLabel>
                            <SelectItem value="low">Low to High</SelectItem>
                            <SelectItem value="high">High to Low</SelectItem>
                        </SelectGroup>

                    </SelectContent>
                </Select>
            </div>
            <Separator className='my-4' />
            <div>
                <h1 className='font-semibold mb-2'>Category</h1>
                {
                    categories.map((category) => (
                        <div key={category.id} className='flex items-center space-x-2 my-3'>
                            <Checkbox id={category.id} onCheckedChange={() => handleCategoryChange(category.id)} />
                            <Label htmlFor={category.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {category.label}
                            </Label>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Filter