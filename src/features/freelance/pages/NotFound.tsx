// /freelance/ 配下の存在しないURL
import { Link } from "react-router-dom";
import { useDocumentHead } from "../lib/useDocumentHead";
import { SERVICE_NAME } from "../config";

export default function NotFound() {
  useDocumentHead({
    title: `ページが見つかりません｜${SERVICE_NAME}`,
    description: "お探しのページは見つかりませんでした。",
    noindex: true,
  });
  return (
    <div className="text-center py-16 space-y-4">
      <h1 className="text-xl font-bold">ページが見つかりません</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">URLが変更されたか、削除された可能性があります。</p>
      <Link to="/freelance/" className="inline-block rounded-xl bg-blue-600 text-white text-sm font-semibold px-5 py-3">
        {SERVICE_NAME}のトップへ
      </Link>
    </div>
  );
}
