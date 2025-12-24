export const formatDate = (dateString: string) =>
	new Date(dateString).toLocaleDateString("UTC", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

export const formatPrice = (price: number) =>
	new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(price / 100);
