import type { HtmlEscapedString } from "hono/utils/html";
import { Layout } from "./components/Layout";
import { Header } from "./components/Header";
import { HolidayFilter } from "./components/HolidayFilter";
import { DateSection } from "./components/DateSection";
import type { DateData } from "../types";

interface AppProps {
  data: DateData[];
}

function App({ data }: AppProps) {
  return (
    <Layout>
      <Header />
      <HolidayFilter />
      {data.length === 0 ? (
        <div class="no-data">データがありません</div>
      ) : (
        data.map((dateData) => (
          <DateSection
            key={dateData.date}
            date={dateData.date}
            spots={dateData.spots}
            dataByHour={dateData.dataByHour}
          />
        ))
      )}
    </Layout>
  );
}

export function renderApp(data: DateData[]): HtmlEscapedString {
  return (<App data={data} />) as HtmlEscapedString;
}

function ErrorPage() {
  return (
    <Layout>
      <Header />
      <div class="no-data">
        <h2>エラーが発生しました</h2>
        <p>
          データの読み込みに失敗しました。しばらくしてから再度お試しください。
        </p>
      </div>
    </Layout>
  );
}

export function renderError(): HtmlEscapedString {
  return (<ErrorPage />) as HtmlEscapedString;
}
