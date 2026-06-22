"use client";

import { useState } from "react";

import {
  UserCircle,
  Mail,
  Phone,
  Building,
  Pencil,
  Save,
  Calendar,
  Shield,
  BadgeCheck,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export default function OrganizerProfilePage() {

  const { user } = useAuth();

  const [editing, setEditing] = useState(false);

  const [phone, setPhone] = useState(
    user?.phone || ""
  );

  const [organization, setOrganization] = useState(
    user?.organization || ""
  );

  const handleSave = async () => {

    try {

      /*
      await api.put("/organizer/profile",{
        phone,
        organization
      });
      */

      alert("Profile Updated Successfully");

      setEditing(false);

    }

    catch(err){

      alert("Failed to update profile");

    }

  };

  return (

    <div className="min-h-screen bg-gray-50 p-8">

      <div className="max-w-5xl mx-auto">


        {/* Header */}

        <div className="bg-white rounded-3xl shadow-sm border p-8">

          <div className="flex flex-col md:flex-row items-center gap-6">

            <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center">

              <UserCircle

                size={95}

                className="text-indigo-600"

              />

            </div>


            <div className="flex-1 text-center md:text-left">

              <h1 className="text-4xl font-bold text-gray-900">

                {user?.fullName || "Organizer"}

              </h1>


              <p className="text-gray-500 mt-2">

                Hackathon Organizer

              </p>


              <div className="mt-4">

                <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-5 py-2 rounded-full font-semibold">

                  <BadgeCheck size={18} />

                  Verified Organizer

                </span>

              </div>

            </div>

          </div>

        </div>



        {/* Main Grid */}

        <div className="grid md:grid-cols-2 gap-7 mt-8">


          {/* Personal Info */}

          <div className="bg-white rounded-3xl shadow-sm border p-7">

            <div className="flex justify-between items-center">

              <h2 className="text-2xl font-bold">

                Personal Information

              </h2>


              {

                !editing ?

                (

                  <button

                    onClick={() => setEditing(true)}

                    className="flex items-center gap-2 text-indigo-600 font-semibold"

                  >

                    <Pencil size={18}/>

                    Edit

                  </button>

                )

                :

                (

                  <button

                    onClick={handleSave}

                    className="flex items-center gap-2 text-green-600 font-semibold"

                  >

                    <Save size={18}/>

                    Save

                  </button>

                )

              }

            </div>



            <div className="space-y-7 mt-8">


              {/* Email */}

              <div className="flex gap-4">

                <Mail className="text-indigo-600"/>

                <div>

                  <p className="text-sm text-gray-500">

                    Email

                  </p>

                  <p className="font-semibold text-gray-800">

                    {user?.email || "Not Available"}

                  </p>

                </div>

              </div>



              {/* Phone */}

              <div className="flex gap-4">

                <Phone className="text-indigo-600"/>

                <div className="w-full">

                  <p className="text-sm text-gray-500">

                    Phone Number

                  </p>


                  {

                    editing ?

                    (

                      <input

                        type="text"

                        value={phone}

                        onChange={(e)=>

                          setPhone(e.target.value)

                        }

                        className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-300"

                      />

                    )

                    :

                    (

                      <p className="font-semibold text-gray-800">

                        {phone || "Not Added"}

                      </p>

                    )

                  }

                </div>

              </div>



              {/* Organization */}

              <div className="flex gap-4">

                <Building className="text-indigo-600"/>

                <div className="w-full">

                  <p className="text-sm text-gray-500">

                    Organization

                  </p>


                  {

                    editing ?

                    (

                      <input

                        type="text"

                        value={organization}

                        onChange={(e)=>

                          setOrganization(e.target.value)

                        }

                        className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-300"

                      />

                    )

                    :

                    (

                      <p className="font-semibold text-gray-800">

                        {organization || "Not Added"}

                      </p>

                    )

                  }

                </div>

              </div>


            </div>

          </div>



          {/* Account Info */}

          <div className="bg-white rounded-3xl shadow-sm border p-7">

            <h2 className="text-2xl font-bold mb-8">

              Account Information

            </h2>


            <div className="space-y-8">


              <div className="flex justify-between">

                <div className="flex gap-3">

                  <Shield className="text-indigo-600"/>

                  <span>

                    Role

                  </span>

                </div>


                <span className="font-semibold">

                  Organizer

                </span>

              </div>



              <div className="flex justify-between">

                <div className="flex gap-3">

                  <Calendar className="text-indigo-600"/>

                  <span>

                    Joined On

                  </span>

                </div>


                <span className="font-semibold">

                  {

                    user?.createdAt

                    ?

                    new Date(

                      user.createdAt

                    ).toLocaleDateString()

                    :

                    "-"

                  }

                </span>

              </div>



              <div className="flex justify-between">

                <span>

                  Account Status

                </span>

                <span className="font-semibold text-green-600">

                  Active

                </span>

              </div>



              <div className="flex justify-between">

                <span>

                  Email Verification

                </span>

                <span className="font-semibold text-green-600">

                  Verified

                </span>

              </div>

            </div>

          </div>


        </div>


      </div>

    </div>

  );

}