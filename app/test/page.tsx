'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8">
          🧪 TEST PAGE
        </h1>
        <button
          onClick={() => {
            alert('TEST BUTTON WORKS!')
          }}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-2xl border-4 border-white"
        >
          🧪 BIG YELLOW TEST BUTTON
        </button>
      </div>
    </div>
  )
}
