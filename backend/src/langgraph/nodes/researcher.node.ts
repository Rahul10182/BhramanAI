import { TravelStateAnnotation } from "../state/travel.state.js";

export const researcherNode = async (state: typeof TravelStateAnnotation.State) => {
  console.log(`--- RESEARCHING FOR: ${state.tripContext.destinations} ---`);
  // In the future, call Person B's MCP tools here
  return { messages: [{ role: "assistant", content: "I have gathered travel data." }] };
};