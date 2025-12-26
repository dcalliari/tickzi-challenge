import { Search, X } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
	placeholder?: string;
	value?: string;
	onSearchChange?: (value: string) => void;
	debounceMs?: number;
	className?: string;
}

export function SearchBar({
	placeholder = "Search...",
	value = "",
	onSearchChange,
	debounceMs = 300,
	className = "w-full sm:w-64",
}: SearchBarProps) {
	const [localValue, setLocalValue] = useState(value);
	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setLocalValue(newValue);

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			onSearchChange?.(newValue);
		}, debounceMs);
	};

	const handleClear = () => {
		setLocalValue("");
		onSearchChange?.("");
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
	};

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return (
		<div className={`relative min-w-0 ${className}`}>
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
			<Input
				type="text"
				placeholder={placeholder}
				value={localValue}
				onChange={handleChange}
				className="pl-9 pr-8"
			/>
			{localValue && (
				<button
					type="button"
					onClick={handleClear}
					className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
					aria-label="Clear search"
				>
					<X className="h-4 w-4" />
				</button>
			)}
		</div>
	);
}
