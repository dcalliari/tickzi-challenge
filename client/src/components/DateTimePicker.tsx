import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
	label?: string;
	selectedDate: Date | undefined;
	selectedTime: string;
	onDateChange: (date: Date | undefined) => void;
	onTimeChange: (time: string) => void;
	required?: boolean;
}

export function DateTimePicker({
	label = "Date & Time",
	selectedDate,
	selectedTime,
	onDateChange,
	onTimeChange,
	required = false,
}: DateTimePickerProps) {
	const [openDatePicker, setOpenDatePicker] = React.useState(false);

	return (
		<div className="space-y-2">
			<Label>
				{label} {required && "*"}
			</Label>
			<div className="flex gap-4">
				<div className="flex flex-col gap-2">
					<Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								id="date-picker"
								className="w-50 justify-between font-normal"
							>
								{selectedDate
									? selectedDate.toLocaleDateString()
									: "Select date"}
								<ChevronDownIcon className="h-4 w-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className="w-auto overflow-hidden p-0"
							align="start"
						>
							<Calendar
								mode="single"
								selected={selectedDate}
								captionLayout="dropdown"
								onSelect={(date) => {
									onDateChange(date);
									setOpenDatePicker(false);
								}}
							/>
						</PopoverContent>
					</Popover>
				</div>
				<div className="flex flex-col gap-2">
					<Input
						type="time"
						id="time-picker"
						value={selectedTime}
						onChange={(e) => onTimeChange(e.target.value)}
						className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
						required={required}
					/>
				</div>
			</div>
		</div>
	);
}
