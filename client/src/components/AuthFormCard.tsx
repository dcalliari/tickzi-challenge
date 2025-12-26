import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormCardProps {
	title: string;
	description: string;
	error: string;
	isLoading: boolean;
	onSubmit: (e: React.FormEvent) => void;
	children: React.ReactNode;
	submitLabel: string;
	footerText: string;
	footerLinkText: string;
	footerLinkTo: string;
}

export function AuthFormCard({
	description,
	error,
	isLoading,
	onSubmit,
	children,
	submitLabel,
	footerText,
	footerLinkText,
	footerLinkTo,
}: AuthFormCardProps) {
	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle className="text-3xl">Tickzi</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<form onSubmit={onSubmit}>
				<CardContent className="space-y-4">
					{error && (
						<div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
							{error}
						</div>
					)}
					{children}
				</CardContent>
				<CardFooter className="flex flex-col gap-4">
					<Button type="submit" className="w-full" disabled={isLoading}>
						{submitLabel}
					</Button>
					<p className="text-sm text-center text-muted-foreground">
						{footerText}{" "}
						<Link to={footerLinkTo} className="text-primary hover:underline">
							{footerLinkText}
						</Link>
					</p>
				</CardFooter>
			</form>
		</Card>
	);
}

interface AuthInputProps {
	id: string;
	label: string;
	type: string;
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
	required?: boolean;
	minLength?: number;
	helperText?: string;
}

export function AuthInput({
	id,
	label,
	type,
	placeholder,
	value,
	onChange,
	required,
	minLength,
	helperText,
}: AuthInputProps) {
	return (
		<div className="space-y-2 mb-4">
			<Label htmlFor={id}>{label}</Label>
			<Input
				id={id}
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				required={required}
				minLength={minLength}
			/>
			{helperText && (
				<p className="text-xs text-muted-foreground">{helperText}</p>
			)}
		</div>
	);
}
