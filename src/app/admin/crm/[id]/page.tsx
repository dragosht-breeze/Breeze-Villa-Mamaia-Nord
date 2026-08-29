import CustomerProfilePage from "@/components/admin/crm/CustomerProfilePage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerProfilePage customerId={id} />;
}
