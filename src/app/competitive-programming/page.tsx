import { PageIntro } from "@/components/PageIntro";
import { getCompetitiveProgrammingData } from "@/lib/cp";
import { CompetitiveProgrammingClient } from "./CompetitiveProgrammingClient";

export const metadata = { title: "Competitive Programming" };

/**
 * Server component – fetches all competitive programming data on the
 * server and passes the resolved object to the client component.
 *
 * The client component never makes its own network requests.
 */
export default async function CompetitiveProgrammingPage() {
  const data = await getCompetitiveProgrammingData();

  return (
    <>
      <PageIntro
        description="Live coding profiles, ratings, and problem-solving progress."
        eyebrow="Coding metrics · 04"
        title="Competitive Programming"
      />
      <CompetitiveProgrammingClient data={data} />
    </>
  );
}
