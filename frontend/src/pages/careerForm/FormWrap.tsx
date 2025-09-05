import type { ReactNode } from "react"

type FormWrapperProps = {
  title: string
  children: ReactNode
}

export function FormWrapper({ title, children }: FormWrapperProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Title Section with gradient background */}
      <div className="relative mb-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 py-6 px-8">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-gray-600 text-sm mt-2">Please fill in all the required information</p>
        </div>
      </div>

      {/* Form Content with enhanced styling */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10 lg:p-12">
        <div className="space-y-6">
          {/* Enhanced styling applied to all form elements */}
          <div className="
            [&>div]:mb-6 [&>div]:space-y-2
            [&_label]:block [&_label]:text-sm [&_label]:font-semibold [&_label]:text-gray-700 [&_label]:mb-2
            [&_label]:relative [&_label]:pl-1
            [&_label:before]:content-[''] [&_label:before]:absolute [&_label:before]:left-0 [&_label:before]:top-0 
            [&_label:before]:w-0.5 [&_label:before]:h-full [&_label:before]:bg-gradient-to-b [&_label:before]:from-blue-500 [&_label:before]:to-purple-500 [&_label:before]:rounded-full
            
            [&_input[type='text']]:w-full [&_input[type='text']]:px-4 [&_input[type='text']]:py-3.5 [&_input[type='text']]:text-gray-800
            [&_input[type='text']]:bg-gray-50 [&_input[type='text']]:border [&_input[type='text']]:border-gray-200 
            [&_input[type='text']]:rounded-xl [&_input[type='text']]:transition-all [&_input[type='text']]:duration-300
            [&_input[type='text']]:focus:outline-none [&_input[type='text']]:focus:ring-2 [&_input[type='text']]:focus:ring-blue-500/20
            [&_input[type='text']]:focus:border-blue-500 [&_input[type='text']]:focus:bg-white [&_input[type='text']]:focus:shadow-lg
            [&_input[type='text']]:hover:border-gray-300 [&_input[type='text']]:hover:bg-white
            [&_input[type='text']::placeholder]:text-gray-400 [&_input[type='text']::placeholder]:text-sm
            
            [&_input[type='number']]:w-full [&_input[type='number']]:px-4 [&_input[type='number']]:py-3.5 [&_input[type='number']]:text-gray-800
            [&_input[type='number']]:bg-gray-50 [&_input[type='number']]:border [&_input[type='number']]:border-gray-200 
            [&_input[type='number']]:rounded-xl [&_input[type='number']]:transition-all [&_input[type='number']]:duration-300
            [&_input[type='number']]:focus:outline-none [&_input[type='number']]:focus:ring-2 [&_input[type='number']]:focus:ring-blue-500/20
            [&_input[type='number']]:focus:border-blue-500 [&_input[type='number']]:focus:bg-white [&_input[type='number']]:focus:shadow-lg
            [&_input[type='number']]:hover:border-gray-300 [&_input[type='number']]:hover:bg-white
            [&_input[type='number']::placeholder]:text-gray-400 [&_input[type='number']::placeholder]:text-sm
            
            [&_select]:w-full [&_select]:px-4 [&_select]:py-3.5 [&_select]:text-gray-800
            [&_select]:bg-gray-50 [&_select]:border [&_select]:border-gray-200 [&_select]:rounded-xl
            [&_select]:transition-all [&_select]:duration-300 [&_select]:cursor-pointer
            [&_select]:focus:outline-none [&_select]:focus:ring-2 [&_select]:focus:ring-blue-500/20
            [&_select]:focus:border-blue-500 [&_select]:focus:bg-white [&_select]:focus:shadow-lg
            [&_select]:hover:border-gray-300 [&_select]:hover:bg-white
            [&_select]:appearance-none [&_select]:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTInIGhlaWdodD0nOCcgdmlld0JveD0nMCAwIDEyIDgnIGZpbGw9J25vbmUnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZD0nTTEgMUw2IDZMMTEgMScgc3Ryb2tlPScjNjM2MzYzJyBzdHJva2Utd2lkdGg9JzInIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcvPjwvc3ZnPg==')] [&_select]:bg-no-repeat [&_select]:bg-[right_16px_center]
            
            [&_textarea]:w-full [&_textarea]:px-4 [&_textarea]:py-3.5 [&_textarea]:text-gray-800
            [&_textarea]:bg-gray-50 [&_textarea]:border [&_textarea]:border-gray-200 [&_textarea]:rounded-xl
            [&_textarea]:transition-all [&_textarea]:duration-300 [&_textarea]:resize-none
            [&_textarea]:focus:outline-none [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-500/20
            [&_textarea]:focus:border-blue-500 [&_textarea]:focus:bg-white [&_textarea]:focus:shadow-lg
            [&_textarea]:hover:border-gray-300 [&_textarea]:hover:bg-white
            [&_textarea::placeholder]:text-gray-400 [&_textarea::placeholder]:text-sm
            
            [&_input[type='checkbox']]:w-5 [&_input[type='checkbox']]:h-5 [&_input[type='checkbox']]:text-blue-600
            [&_input[type='checkbox']]:bg-gray-50 [&_input[type='checkbox']]:border-2 [&_input[type='checkbox']]:border-gray-300
            [&_input[type='checkbox']]:rounded-md [&_input[type='checkbox']]:focus:ring-blue-500 [&_input[type='checkbox']]:focus:ring-2
            [&_input[type='checkbox']]:transition-all [&_input[type='checkbox']]:duration-200
            [&_input[type='checkbox']]:hover:border-gray-400 [&_input[type='checkbox']]:cursor-pointer
          ">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
